import { useState, useEffect } from 'react'
import { clearSession, getFriendship, getFriendshipChats } from '../../helpers/api'
import { useScreenType } from '../../hooks/useScreenType'
import { Chat } from '../../models/Chat'
import { Friendship } from '../../models/Friendship'
import { User } from '../../models/User'
import { useStateValue } from '../../state'
import '../../styles/blocks/chat-room.scss'
import TextField from '../atoms/text-field'
import TextMessageBlob from '../atoms/text-message-blob'
import backIcon from '../../assets/img/back_icon.svg'
import Skeleton from "react-loading-skeleton";
import { ChatLoadingSkeleton } from './chat-loading-skeleton'

type ChatRoomProps = {
    friend: User
    setIsInRoom: Function
}

function ChatRoom({ friend, setIsInRoom }: ChatRoomProps) {
    const [ { socket, userData, chatData }, dispatch ] = useStateValue()
    const [ message, setMessage ] = useState('')
    const [ friendship, setFriendship ] = useState<Friendship>(new Friendship())
    const screenType = useScreenType()
    const [ isLoading, setIsLoading ] = useState(false)

    const getFriendshipData = async () => {
        let friendship: Friendship
        try {
            friendship = await getFriendship(localStorage.getItem('authToken') || '', friend.id)
        } catch (e) {
            clearSession()
            return
        }
        const roomId: string =  'F' + friendship.id

        setFriendship(friendship)
        dispatch({ type: 'changeChatDataCurrRoomId', value: roomId })
        
        if (chatData.chatRooms.get(roomId) === undefined)
            dispatch({ type: 'createChatRoom', value: roomId })
    }

    const getMessages = async () => {
        const friendshipId: number = parseInt(chatData.currRoomId.substring(1))
        const res = await getFriendshipChats(localStorage.getItem('authToken') || '', friendshipId)
        console.log(res)
        dispatch({
            type: 'changeChatDataList',
            value: res
        })
    }

    const sendMessage = () => {
        if(socket !== null && message !== '' && message !== null && message !== undefined) {
            const friendshipId: number = parseInt(chatData.currRoomId.substring(1))
            const previewChat = new Chat(userData.user.id, friendshipId, message, new Date())

            dispatch({
                type: 'changeChatDataPreviewChat',
                value: { roomId: chatData.currRoomId, previewChat }
            })
            socket.emit('send_message', {
                roomId: chatData.currRoomId,
                newChat: previewChat,
                token: localStorage.getItem('authToken') + ''
            })
            setMessage('')
        }
    }

    async function fetchChatRoomData() {
        if (socket !== null) {
            if (chatData.chatRooms.get(chatData.currRoomId) === undefined)
                setIsLoading(true)

            if (chatData.currRoomId === '')
                await getFriendshipData()

            await getMessages()

            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchChatRoomData()

    }, [friendship.id, friend.id, socket, userData.user.uid, chatData.currRoomId])

    return <section className="chat-room-container">
        <header className="friend-header">
            {screenType === 'mobile' &&
                <button
                    className="btn btn-secondary"
                    onClick={() => setIsInRoom(false)}>
                        <img src={backIcon} alt="back_icn"/>
                </button> }
            <img src={ `data:image/png;base64, ${ friend.profilePic}` } alt="profile pic"/>
            <label>{ friend.nomeProprio + " " + friend.apelido }</label>
        </header>

        {(chatData.currRoomId !== '' && chatData.currRoomId !== 'F-1') &&
            <div className="chat-display-container">
                { isLoading 
                    ? <>
                        <ChatLoadingSkeleton />
                    </>
                    : <>
                        { (chatData.chatRooms.get(chatData.currRoomId) !== undefined && chatData.chatRooms.get(chatData.currRoomId)?.previewChat !== null) &&
                            <TextMessageBlob
                                isPreview={true}
                                chat={chatData.chatRooms.get(chatData.currRoomId)?.previewChat} 
                                viewingUser={userData.user} /> }
        
                        { chatData.chatRooms.get(chatData.currRoomId) !== undefined &&
                            chatData.chatRooms.get(chatData.currRoomId).chatsList.map((chat: Chat) =>
                                <TextMessageBlob
                                    isPreview={false}
                                    key={`${chat.id}-${friend.username}`} 
                                    chat={chat} 
                                    viewingUser={userData.user} />) }
                    </> }
            </div>
        }

        <div className="chat-writer-container">
            <div className="input-container">
                <TextField
                    classes={'no-borders white-bg giant-borders'}
                    placeholder=''
                    value={message}
                    onInputChange={setMessage}/>
                <button className="btn btn-secondary" onClick={sendMessage}>Send</button>
            </div>
        </div>
    </section>
}

export default ChatRoom
