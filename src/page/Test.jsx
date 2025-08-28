import { useState } from "react";
import { SpeakerWaveIcon } from "@heroicons/react/24/outline"; // optional icon

function ChatMessage() {
  const [speaking, setSpeaking] = useState(false);
  const message =
    "If you want, I can make a full ReactMarkdown integration so that every AI message rendered in markdown automatically gets its own voice button, just like ChatGPT’s UI.";

  const handleSpeak = () => {
    if (!message) return;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "en-US";
    setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex items-start gap-2 my-2">
      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg relative">
        <p className="text-gray-800 dark:text-gray-200">{message}</p>

        <button
          onClick={handleSpeak}
          className="absolute top-1 right-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
        >
          <SpeakerWaveIcon
            className={`w-5 h-5 ${
              speaking ? "text-green-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default ChatMessage;
