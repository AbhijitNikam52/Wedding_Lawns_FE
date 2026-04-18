import { useState, useEffect } from "react";
import { fetchConversations } from "../../services/chatService";
import Spinner from "../ui/Spinner";

const ConversationList = ({ activeLawnId, onSelect }) => {
  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    fetchConversations()
      .then((d) => setConversations(d.conversations))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="sm" text="Loading..." />;

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-4xl mb-2">📭</p>
        <p className="text-gray-400 text-sm">No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-purple-50">
      {conversations.map((convo) => {
        const lawn      = convo.lawnId;
        const isActive  = activeLawnId === lawn?._id;
        const thumbnail = lawn?.photos?.[0];

        return (
          <button
            key={lawn?._id}
            onClick={() => onSelect(convo)}
            className={`w-full text-left p-4 flex items-center gap-3 hover:bg-purple-50 transition-all ${
              isActive ? "bg-purple-50 border-r-4 border-primary" : ""
            }`}
          >
            {/* Lawn thumbnail */}
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-purple-100 flex-shrink-0">
              {thumbnail ? (
                <img src={thumbnail} alt={lawn?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">🏡</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <p className={`text-sm font-semibold truncate ${isActive ? "text-primary" : "text-dark"}`}>
                  {lawn?.name}
                </p>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {formatTime(convo.timestamp)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400 truncate">{convo.lastMessage}</p>
                {convo.unreadCount > 0 && (
                  <span className="flex-shrink-0 ml-2 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date  = new Date(timestamp);
  const now   = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
};

export default ConversationList;