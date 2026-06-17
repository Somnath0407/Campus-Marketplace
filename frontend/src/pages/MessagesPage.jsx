import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMessaging } from '../context/MessagingContext';
import {
  ArrowLeft,
  Send,
  Mail,
  Clock,
  Trash2,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    deleteMessage,
  } = useMessaging();

  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedConv, setSelectedConv] = useState(null);
  const [sellerToMessage, setSellerToMessage] = useState(null);
  const [loadingSeller, setLoadingSeller] = useState(false);

  const sellerId = searchParams.get('sellerId');

  // Load conversations and check for seller
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle sellerId from URL
  useEffect(() => {
    if (sellerId) {
      setLoadingSeller(true);
      // Look for existing conversation with this seller
      const existingConv = conversations.find((conv) =>
        conv.participants.some((p) => p._id === sellerId)
      );

      if (existingConv) {
        // Open existing conversation
        setSelectedConv(existingConv._id);
        setCurrentConversation(existingConv._id);
        setSellerToMessage(null);
      } else {
        // Find seller info from conversations to show seller context
        const sellerInfo = conversations
          .flatMap((c) => c.participants)
          .find((p) => p._id === sellerId);

        if (!sellerInfo) {
          // Fetch seller by calling the API or use minimal info
          setSellerToMessage({ _id: sellerId, name: 'Seller', college: '' });
        } else {
          setSellerToMessage(sellerInfo);
        }
      }
      setLoadingSeller(false);
    }
  }, [sellerId, conversations, setCurrentConversation]);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation);
      setSelectedConv(currentConversation);
    }
  }, [currentConversation, fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;

    // Case 1: Sending to existing conversation
    if (selectedConv) {
      const otherParticipant = conversations.find(
        (c) => c._id === selectedConv
      )?.participants.find((p) => p._id !== user._id);

      if (!otherParticipant) return;

      setSending(true);
      try {
        await sendMessage(otherParticipant._id, messageText);
        setMessageText('');
        toast.success('Message sent!');
      } catch {
        toast.error('Failed to send message');
      } finally {
        setSending(false);
      }
    }
    // Case 2: Starting new conversation with seller
    else if (sellerToMessage) {
      setSending(true);
      try {
        await sendMessage(sellerToMessage._id, messageText);
        setMessageText('');
        setSellerToMessage(null);
        toast.success('Message sent!');
        // Refresh conversations to see the new one
        await fetchConversations();
      } catch {
        toast.error('Failed to send message');
      } finally {
        setSending(false);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const currentConv = conversations.find((c) => c._id === selectedConv);
  const otherUser = currentConv?.participants.find((p) => p._id !== user._id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)] flex gap-4">
      {/* Conversations List */}
      <div className="w-full md:w-72 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail size={18} />
            Messages
          </h2>
        </div>

        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = conv.participants.find((p) => p._id !== user._id);
              return (
                <button
                  key={conv._id}
                  onClick={() => {
                    setCurrentConversation(conv._id);
                    setSelectedConv(conv._id);
                  }}
                  className={`w-full p-3 text-left border-b border-gray-100 dark:border-gray-800 transition-colors ${
                    selectedConv === conv._id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {other?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {other?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                      {conv.lastMessageTime && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(conv.lastMessageTime).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col shadow-sm hidden md:flex">
        {selectedConv && currentConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {otherUser?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {otherUser?.college}
                </p>
              </div>
              {currentConv.productId && (
                <button
                  onClick={() =>
                    navigate(`/product/${currentConv.productId._id}`)
                  }
                  className="text-xs text-blue-600 hover:underline"
                >
                  View Product
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-400">
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${
                      msg.senderId._id === user._id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-xl text-sm group relative ${
                        msg.senderId._id === user._id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                          hours: '2-digit',
                          minutes: '2-digit',
                        })}
                      </p>

                      {/* Delete button */}
                      {msg.senderId._id === user._id && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2"
            >
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!messageText.trim() || sending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors flex items-center gap-1"
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
          </>
        ) : sellerToMessage ? (
          <>
            {/* New Message Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <p className="font-bold text-gray-900 dark:text-white">
                Message to: {sellerToMessage?.name || 'Seller'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {sellerToMessage?.college || 'Start a new conversation'}
              </p>
            </div>

            {/* Compose Area */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center text-gray-400">
                <MessageSquare size={48} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm mb-4">
                  Send your first message to {sellerToMessage?.name || 'this seller'}
                </p>
              </div>
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2"
            >
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                autoFocus
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!messageText.trim() || sending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors flex items-center gap-1"
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-2 opacity-40" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
