import React, { useState, useEffect } from 'react';
import { Message, UserProfile } from '../types';
import { accommodationService } from '../services/accommodationService';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ChatProps {
  accommodationId: string;
  currentUser: UserProfile;
  landlordId: string;
}

export const Chat: React.FC<ChatProps> = ({ accommodationId, currentUser, landlordId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = accommodationService.subscribeToMessages(accommodationId, (data) => {
      setMessages(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [accommodationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Omit<Message, 'id'> = {
      accommodationId,
      senderId: currentUser.uid,
      receiverId: landlordId,
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    await accommodationService.sendMessage(message);
    setNewMessage('');
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm flex flex-col h-[400px]">
      <div className="p-4 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50 rounded-t-2xl">
        <MessageSquare size={18} className="text-blue-600" />
        <h3 className="font-bold text-sm">Chat with Landlord</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-neutral-400 text-sm italic">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.senderId === currentUser.uid ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  msg.senderId === currentUser.uid 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-neutral-100 text-neutral-800 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 px-1">
                {format(new Date(msg.timestamp), 'HH:mm')}
              </span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-100 flex gap-2">
        <input 
          type="text" 
          placeholder="Type a message..." 
          className="flex-1 px-4 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button 
          type="submit"
          className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
