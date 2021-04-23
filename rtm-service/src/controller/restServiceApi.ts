import { Chat } from "../model/Chat";
import { JoinRoomData } from "../model/JoinRoomData";

const _fetch = require("node-fetch");

const validateToken = (data: JoinRoomData) => {
    return _fetch(`${process.env.REST_SERVICE_URL}/validateToken?token=${data.token}&uid=${data.uid}`)
        .then((r: any) => r.json())
}

const getFriendshipChats = (token: string, friendshipId: number) => {
    return _fetch(`${process.env.REST_SERVICE_URL}/getChatsFromFriendship?friendshipId=${friendshipId}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }).then((res: any) => res.json())
}

const persistChat = (token: string, newChat: Chat): Promise<Chat> => {
    return _fetch(`${process.env.REST_SERVICE_URL}/persistChat`, {
        headers: {
            'Authorization': 'Bearer ' + token
        },
        method: 'POST',
        body: JSON.stringify(newChat)
    }).then((res: any) => res.json())
}

export {
    validateToken,
    getFriendshipChats,
    persistChat
}