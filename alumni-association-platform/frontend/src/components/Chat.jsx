import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import UserList from './UserList';
import useAuthStore from '../store/authStore';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [view, setView] = useState('chats'); // 'chats', 'new-chat'
  const [userType, setUserType] = useState('mentors');
  const { user } = useAuthStore();

  // Set user type based on current user's role
  useEffect(() => {
    if (user?.role === 'student') {
      setUserType('mentors');
    } else if (user?.role === 'alumni') {
      setUserType('mentees');
    }
  }, [user]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setView('chats');
  };

  const handleNewChat = (chat) => {
    setSelectedChat(chat);
    setView('chats');
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  const handleNewChatClick = () => {
    setView('new-chat');
  };

  const handleBackToChats = () => {
    setView('chats');
  };

  return (
    <div className="h-screen bg-gray-50">
      <div className="h-full flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {view === 'chats' ? 'Messages' : `New Chat with ${userType}`}
              </h2>
              {view === 'chats' && (
                <button
                  onClick={handleNewChatClick}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
              {view === 'new-chat' && (
                <button
                  onClick={handleBackToChats}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {view === 'chats' ? (
              <ChatList
                onChatSelect={handleChatSelect}
                selectedChatId={selectedChat?._id}
              />
            ) : (
              <UserList
                onUserSelect={handleNewChat}
                userType={userType}
              />
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatWindow
            selectedChat={selectedChat}
            onBack={handleBack}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
