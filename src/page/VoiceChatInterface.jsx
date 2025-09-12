"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, X } from "lucide-react";

export default function VoiceChatInterface({ onClose, voiceChat }) {
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const toggleListening = () => {
    setIsListening(!isListening);
    if (isListening) voiceChat();
  };

  const handleClose = () => {
    setIsListening(false);
    setIsConnected(false);
    onClose();
  };

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col items-center justify-center overflow-hidden">
      {/* Main voice orb */}
      <div className="relative flex items-center justify-center mb-16">
        <div
          className={`
            relative w-64 h-64 rounded-full 
            bg-gradient-to-br from-blue-300 via-blue-500 to-blue-700
            ${isListening ? "animate-pulse" : ""}
            transition-all duration-500 ease-in-out
            ${
              isListening
                ? "scale-110 shadow-2xl shadow-blue-500/30"
                : "scale-100"
            }
          `}
          style={{
            background: isListening
              ? "radial-gradient(circle at 30% 30%, rgba(147, 197, 253, 0.8), rgba(59, 130, 246, 0.9), rgba(29, 78, 216, 1))"
              : "radial-gradient(circle at 30% 30%, rgba(147, 197, 253, 0.6), rgba(59, 130, 246, 0.8), rgba(29, 78, 216, 0.9))",
          }}
        >
          {/* Inner glow effect */}
          <div
            className={`
              absolute inset-4 rounded-full 
              bg-gradient-to-br from-white/20 to-transparent
              ${isListening ? "animate-ping" : ""}
            `}
          />

          {/* Outer ring animation */}
          {isListening && (
            <div className="absolute -inset-8 rounded-full border-2 border-blue-400/30 animate-ping" />
          )}
        </div>
      </div>

      {/* Status text */}
      <div className="mb-12 text-center">
        <p className="text-lg font-medium">
          {isConnected ? "Advanced Voice" : "Voice chat ended"}
        </p>
        {isListening && (
          <p className="text-slate-600 text-sm mt-2 animate-pulse">
            Listening...
          </p>
        )}
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-8">
        {/* Microphone button */}
        <Button
          onClick={toggleListening}
          size="lg"
          variant="ghost"
          className={`
            w-16 h-16 rounded-full 
            ${
              isListening
                ? "bg-red-500 hover:bg-red-600 text-slate-300 hover:text-slate-200 cursor-pointer"
                : "bg-gray-800 hover:bg-gray-900 text-slate-300 hover:text-slate-200 cursor-pointer"
            }
            transition-all duration-200
          `}
        >
          {isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        {/* Close button */}
        <Button
          onClick={handleClose}
          size="lg"
          variant="ghost"
          className="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-900 text-gray-300 hover:text-gray-200 cursor-pointer transition-all duration-200"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Background ambient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent pointer-events-none" />
    </div>
  );
}
