import api from "./api";

// Get message history for a lawn conversation
export const fetchChatHistory = (lawnId) =>
  api.get(`/chat/${lawnId}`).then((r) => r.data);

// Send a message via REST (also handled via socket, but REST persists reliably)
export const sendMessage = (lawnId, message, receiverId) =>
  api.post(`/chat/${lawnId}`, { message, receiverId }).then((r) => r.data);

// Get all conversations for the current user
export const fetchConversations = () =>
  api.get("/chat/conversations").then((r) => r.data);

// Mark all messages in a lawn conversation as read
export const markAsRead = (lawnId) =>
  api.put(`/chat/${lawnId}/read`).then((r) => r.data);

// Get unread message count for a lawn
export const fetchUnreadCount = (lawnId) =>
  api.get(`/chat/${lawnId}/unread-count`).then((r) => r.data);

// Delete a message
export const deleteMessage = (messageId) =>
  api.delete(`/chat/message/${messageId}`).then((r) => r.data);