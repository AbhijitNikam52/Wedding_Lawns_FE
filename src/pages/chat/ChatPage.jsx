import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth }   from "../../context/AuthContext";
import { fetchLawnById } from "../../services/lawnService";
import ConversationList from "../../components/chat/ConversationList";
import ChatWindow       from "../../components/chat/ChatWindow";
import Spinner from "../../components/ui/Spinner";

const ChatPage = () => {
  const { lawnId }          = useParams();
  const { user }            = useAuth();
  const [lawn, setLawn]     = useState(null);
  const [loading, setLoading] = useState(!!lawnId);
  const [activeLawnId, setActiveLawnId] = useState(lawnId || null);
  const [activeLawn,   setActiveLawn]   = useState(null);

  // If lawnId in URL, load that lawn info
  useEffect(() => {
    if (!lawnId) return;
    fetchLawnById(lawnId)
      .then((d) => {
        setLawn(d.lawn);
        setActiveLawn(d.lawn);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lawnId]);

  const handleSelectConversation = (convo) => {
    setActiveLawnId(convo.lawnId._id);
    setActiveLawn(convo.lawnId);
  };

  if (loading) return <Spinner text="Loading chat..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-dark mb-6">💬 Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[75vh]">
        {/* Left: Conversation list */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-purple-50">
            <h2 className="font-semibold text-dark text-sm">Conversations</h2>
          </div>
          <div className="flex-grow overflow-y-auto">
            <ConversationList
              activeLawnId={activeLawnId}
              onSelect={handleSelectConversation}
            />
          </div>
        </div>

        {/* Right: Chat window */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden flex flex-col">
          {activeLawnId ? (
            <ChatWindow
              lawnId={activeLawnId}
              lawn={activeLawn}
              currentUser={user}
            />
          ) : (
            <NoChatSelected />
          )}
        </div>
      </div>
    </div>
  );
};

const NoChatSelected = () => (
  <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
    <div className="text-6xl mb-4">💬</div>
    <h3 className="text-lg font-bold text-dark mb-2">No chat selected</h3>
    <p className="text-gray-400 text-sm">
      Select a conversation from the list, or go to a lawn page and click
      "Chat with Owner" to start a new one.
    </p>
  </div>
);

export default ChatPage;