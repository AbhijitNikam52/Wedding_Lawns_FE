const MessageBubble = ({ message, isMine }) => {
  const { message: text, timestamp, isRead, isTemp } = message;

  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] group`}>
        {/* Bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
            isMine
              ? "bg-primary text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          } ${isTemp ? "opacity-70" : ""}`}
        >
          {text}
        </div>

        {/* Meta: time + read status */}
        <div
          className={`flex items-center gap-1 mt-1 px-1 ${
            isMine ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-xs text-gray-400">{time}</span>
          {isMine && (
            <span className={`text-xs ${isRead ? "text-blue-500" : "text-gray-400"}`}>
              {isTemp ? "⏳" : isRead ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;