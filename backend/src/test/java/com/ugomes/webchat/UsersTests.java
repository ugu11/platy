package com.ugomes.webchat;

import com.ugomes.webchat.ApiResponses.SearchUserResponse;
import com.ugomes.webchat.ApiResponses.UserData;
import com.ugomes.webchat.Controllers.FriendsController;
import com.ugomes.webchat.Controllers.UsersController;
import com.ugomes.webchat.Utils.JwtTokenUtil;
import com.ugomes.webchat.models.Friends;
import com.ugomes.webchat.models.User;
import com.ugomes.webchat.repositories.FriendsRepo;
import com.ugomes.webchat.repositories.FriendsRequestRepo;
import com.ugomes.webchat.repositories.UsersRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

@Service
public class UsersTests {
    private final UsersRepo usersRepo = Mockito.mock(UsersRepo.class);
    private final FriendsRequestRepo friendsRequestRepo = Mockito.mock(FriendsRequestRepo.class);
    private final FriendsRepo friendsRepo = Mockito.mock(FriendsRepo.class);

    private FriendsController friendsController;
    private UsersController usersController;

    @BeforeEach
    void initUseCase() {
        friendsController = new FriendsController(usersRepo, friendsRequestRepo, friendsRepo);
        usersController = new UsersController(usersRepo, friendsRequestRepo, friendsRepo);
    }

    @Test
    void searchUsersBySubstring() {
        List<User> usersList = new ArrayList<>();
        usersList.add(new User(1L,"Hugo", "Gomes", "zezoca11"));
        usersList.add(new User(2L, "Ze", "Cotrim", "profjam3"));
        usersList.add(new User(3L, "Mano", "Zezoca>", "zenabo"));
        usersList.get(0).setUid("123456789111");
        usersList.get(1).setUid("223456789111");
        usersList.get(2).setUid("323456789111");
        String authUserToken = "Bearer " + JwtTokenUtil.generateToken(usersList.get(0));
        String searchTerm = "zez";

        when(usersRepo.findByUserOrName(searchTerm)).thenReturn(usersList);
        when(usersRepo.findByUid(usersList.get(0).getUid())).thenReturn(java.util.Optional.ofNullable(usersList.get(0)));

        List<User> expected = new ArrayList<>();
        expected.add(usersList.get(1));
        expected.add(usersList.get(2));

        ResponseEntity<SearchUserResponse> queryResult = friendsController.searchUser(searchTerm, authUserToken);
        assertEquals(expected, Objects.requireNonNull(queryResult.getBody()).getSearchedUsers());
    }

    @Test
    void searchUsersByEmptySubstring() {
        List<User> usersList = new ArrayList<>();
        usersList.add(new User(1L,"Hugo", "Gomes", "zezoca11"));
        usersList.add(new User(2L, "Ze", "Cotrim", "profjam3"));
        usersList.add(new User(3L, "Mano", "Zezoca>", "zenabo"));
        usersList.get(0).setUid("123456789111");
        String authUserToken = "Bearer " + JwtTokenUtil.generateToken(usersList.get(0));

        String searchTerm = "";

        when(usersRepo.findByUserOrName(searchTerm)).thenReturn(usersList);
        when(usersRepo.findAll()).thenReturn(usersList);

        ResponseEntity<SearchUserResponse> queryResult = friendsController.searchUser(searchTerm, authUserToken);
        assertEquals(0, Objects.requireNonNull(queryResult.getBody()).getSearchedUsers().size());
    }

    @Test
    void getUserDataWithValidAuthToken() {
        User user = new User(1L,"Hugo", "Gomes", "zezoca11");
        user.setUid("123123123123");
        String authUserToken = "Bearer " + JwtTokenUtil.generateToken(user);

        when(usersRepo.findByUid(user.getUid())).thenReturn(java.util.Optional.of(user));
        when(friendsRepo.countFriendsByUser1OrUser2(user, user)).thenReturn(1);

        ResponseEntity<UserData> queryResult = usersController.getUserData(authUserToken);

        assertEquals(user, Objects.requireNonNull(queryResult.getBody()).getUser());
        assertEquals(1, queryResult.getBody().getFriendsCount());
    }

    @Test
    void dontGetUserDataWithInvalidAuthToken() {
        User user = new User(1L,"Hugo", "Gomes", "zezoca11");
        user.setUid("123123123123");
        String authUserToken = "Bearer " + JwtTokenUtil.generateToken(user) + "das";

        when(usersRepo.findByUid(user.getUid())).thenReturn(java.util.Optional.of(user));
        when(friendsRepo.countFriendsByUser1OrUser2(user, user)).thenReturn(1);

        ResponseEntity<UserData> queryResult = usersController.getUserData(authUserToken);

        assertNull(Objects.requireNonNull(queryResult.getBody()).getUser());
        assertEquals(0, queryResult.getBody().getFriendsCount());
    }

}
