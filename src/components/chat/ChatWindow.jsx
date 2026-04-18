import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { fetchChatHistory, markAsRead } from "../../services/chatService";
import { fetchLawnById } from "../../services/lawnService";
import MessageBubble from "./MessageBubble";
import Spinner from "../ui/Spinner";
import toast from "react-hot-toast";

const ChatWindow = ({ lawnId, lawn: propLawn, currentUser }) => {
  const { socket }              = useSocket();
  const [messages,   setMessages]   = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading,    setLoading]    = useState(true);
  const [sending,    setSending]    = useState(false);
  const [typing,     setTyping]     = useState(false);   // someone else is typing
  const [lawn,       setLawn]       = useState(propLawn || null);
  const [receiverId, setReceiverId] = useState(null);
  const bottomRef    = useRef(null);
  const typingTimer  = useRef(null);
  const isOwner      = currentUser?.role === "owner";

  // ── Load history + lawn info ─────────────────────────────
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const [histData] = await Promise.all([
        fetchChatHistory(lawnId),
        !propLawn && fetchLawnById(lawnId).then((d) => setLawn(d.lawn)),
      ]);
      setMessages(histData.messages);

      // Determine receiverId
      if (histData.messages.length > 0) {
        const firstMsg = histData.messages[0];
        const rid =
          firstMsg.senderId._id === currentUser._id
            ? firstMsg.receiverId._id
            : firstMsg.senderId._id;
        setReceiverId(rid);
      }

      // Mark messages as read
      await markAsRead(lawnId);
    } catch (err) {
      console.error("Chat load error:", err);
    } finally {
      setLoading(false);
    }
  }, [lawnId, currentUser, propLawn]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Set receiverId from lawn (owner = lawn.ownerId)
  useEffect(() => {
    if (lawn && !receiverId) {
      if (!isOwner) {
        // User chatting → receiver is the owner
        setReceiverId(
          typeof lawn.ownerId === "object" ? lawn.ownerId._id : lawn.ownerId
        );
      }
    }
  }, [lawn, isOwner, receiverId]);

  // ── Socket setup ─────────────────────────────────────────
  useEffect(() => {
    if (!socket || !lawnId || !currentUser) return;

    // Join the room
    socket.emit("join_room", { lawnId, userId: currentUser._id });

    // Listen for incoming messages
    const onReceive = (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // Mark as read immediately if window is open
      markAsRead(lawnId).catch(() => {});
    };

    // Typing events
    const onTypingStart = () => setTyping(true);
    const onTypingStop  = () => setTyping(false);

    // Read receipts
    const onRead = () => {
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId._id === currentUser._id ? { ...m, isRead: true } : m
        )
      );
    };

    socket.on("receive_message", onReceive);
    socket.on("typing_start",    onTypingStart);
    socket.on("typing_stop",     onTypingStop);
    socket.on("messages_read",   onRead);

    return () => {
      socket.off("receive_message", onReceive);
      socket.off("typing_start",    onTypingStart);
      socket.off("typing_stop",     onTypingStop);
      socket.off("messages_read",   onRead);
    };
  }, [socket, lawnId, currentUser]);

  // ── Auto-scroll to bottom ────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // ── Typing indicator emit ─────────────────────────────────
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !currentUser) return;

    socket.emit("typing_start", { lawnId, userId: currentUser._id });

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing_stop", { lawnId, userId: currentUser._id });
    }, 1500);
  };

  // ── Send message ─────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !receiverId) return;

    setSending(true);
    // Stop typing indicator
    clearTimeout(typingTimer.current);
    socket?.emit("typing_stop", { lawnId, userId: currentUser._id });

    // Optimistic UI — add message immediately
    const tempMsg = {
      _id:        `temp_${Date.now()}`,
      senderId:   currentUser,
      receiverId: { _id: receiverId },
      lawnId,
      message:    text,
      isRead:     false,
      timestamp:  new Date().toISOString(),
      isTemp:     true,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");

    try {
      // Emit via socket (socketHandler.js persists to DB and broadcasts)
      socket?.emit("send_message", {
        lawnId,
        userId:     currentUser._id,
        receiverId,
        message:    text,
      });
    } catch {
      toast.error("Failed to send message");
      // Remove temp message on failure
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
    } finally {
      setSending(false);
    }
  };

  // ── Enter to send ────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (loading) return <Spinner text="Loading messages..." />;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-purple-50 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-purple-100 flex-shrink-0">
          {lawn?.photos?.[0] ? (
            <img src={lawn.photos[0]} alt={lawn?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg">🏡</div>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <Link
            to={`/lawns/${lawnId}`}
            className="font-bold text-dark hover:text-primary transition-colors text-sm truncate block"
          >
            {lawn?.name || "Lawn"}
          </Link>
          <p className="text-xs text-gray-400">📍 {lawn?.city}</p>
        </div>
        <Link
          to={`/lawns/${lawnId}`}
          className="text-xs text-primary border border-primary px-3 py-1 rounded-lg hover:bg-primary hover:text-white transition-all flex-shrink-0"
        >
          View Lawn
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-gray-400 text-sm">
              No messages yet. Say hello to get started!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isMine={
                (msg.senderId?._id || msg.senderId) === currentUser._id ||
                (msg.senderId?._id || msg.senderId)?.toString() === currentUser._id?.toString()
              }
            />
          ))
        )}

        {/* Typing indicator */}
        {typing && (
          <div className="flex items-end gap-2">
            <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-bl-none px-4 py-2 text-sm">
              <span className="flex gap-1 items-center">
                <span className="animate-bounce delay-0  w-1.5 h-1.5 bg-gray-400 rounded-full inline-block" />
                <span className="animate-bounce delay-150 w-1.5 h-1.5 bg-gray-400 rounded-full inline-block" />
                <span className="animate-bounce delay-300 w-1.5 h-1.5 bg-gray-400 rounded-full inline-block" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-purple-50 flex gap-2 flex-shrink-0"
      >
        <textarea
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          className="flex-grow input-field resize-none text-sm py-2.5 max-h-32"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim() || !receiverId}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;