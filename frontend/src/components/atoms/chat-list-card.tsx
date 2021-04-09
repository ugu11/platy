import '../../styles/atoms/chat-list-card.scss'
import { RecentChat } from '../../models/RecentChat';

type ChatListCardProps = {
    chat: RecentChat
    selectHandler: Function
}

function ChatListCard({ chat, selectHandler }: ChatListCardProps) {
    return <div className="chat-list-card" onClick={() => selectHandler(chat.friend, chat.friendshipId)}>
        <img src={`data:image/png;base64, ${chat.friend.profilePic}`} alt="profile pic"/>
        <article>
            <h4>{ `${chat.friend.nomeProprio} ${chat.friend.apelido}` }</h4>
            <p>{ chat.lastMessage.length >= 25 
                ? chat.lastMessage.substr(0, 25) + '...'
                : chat.lastMessage }</p>
        </article>
    </div>
}

export default ChatListCard