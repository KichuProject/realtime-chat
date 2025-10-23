import { useEffect } from "react";
import{ useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from"./MessageInput";
import MessageSkeleton from"./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useRef } from "react";
import { ArrowLeft } from "lucide-react";

const ChatContainer = () => {
  const { messages, getMessages ,isMessagesLoading,selectedUser,subscribeToNewMessages,unsubscribeFromMessages,setSelectedUser} = useChatStore();
  const { authUser } = useAuthStore();
  const MessageEndRef=useRef(null);
  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToNewMessages();
    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser,getMessages, subscribeToNewMessages,unsubscribeFromMessages]);

  useEffect(() => {
    if (MessageEndRef.current&&messages) {
      MessageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


  if(isMessagesLoading){
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader/>
        <MessageSkeleton />
        <MessageInput/>
      </div>
    )
  }
  
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="md:hidden flex items-center gap-3 p-4 border-b border-base-300">
        <button 
          onClick={() => setSelectedUser(null)}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <ArrowLeft className="size-4" />
        </button>
        <span className="font-medium">Back to Contacts</span>
      </div>
      
      <ChatHeader/>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message._id}
            className={`chat ${message.senderId === authUser._id ? 'chat-end' : 'chat-start'}`}
            ref={MessageEndRef}
            >
          <div className="chat-image avatar">
            <div className="size-10 rounded-full border">
              <img src={message.senderId === authUser._id 
                ? authUser.profilepic || "/avatar.png" 
                : selectedUser.profilepic || "/avatar.png"} alt="profile pic" />
            </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image &&(
                <img
                  src={message.image}
                  alt="attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text &&<p>{message.text}</p>}
            </div>
          </div>

        ))}
      </div>
      <MessageInput/>
    </div>
  )
}

export default ChatContainer