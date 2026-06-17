import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const MessagingContext = createContext(null);

export const MessagingProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/messages/conversations/${conversationId}`);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (receiverId, text, productId = null) => {
      try {
        const { data } = await api.post('/messages/send', {
          receiverId,
          text,
          productId,
        });

        setMessages((prev) => [...prev, data.message]);
        setCurrentConversation(data.conversation);

        // Refresh conversations to update last message
        await fetchConversations();

        return data;
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    [fetchConversations]
  );

  const deleteMessage = useCallback(async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await api.get('/messages/unread-count');
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        currentConversation,
        setCurrentConversation,
        messages,
        loading,
        unreadCount,
        fetchConversations,
        fetchMessages,
        sendMessage,
        deleteMessage,
        fetchUnreadCount,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error('useMessaging must be used within MessagingProvider');
  return ctx;
};
