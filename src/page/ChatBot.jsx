"use client";
import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Search,
  MessageSquare,
  Mic,
  FileText,
  MoreHorizontal,
  Trash2,
  User,
  Bot,
  Share,
  Settings,
  LogOut,
  X,
  Plus,
  Image,
  FileTextIcon,
  Lightbulb,
  File,
  FileCode,
  FileImage,
  Copy,
  Check,
  CirclePause,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import axios from "axios";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate, useParams } from "react-router-dom";
import { uploadPicture } from "@/service/ImageService";
import { ChatSearchModal } from "@/components/ChatSearchModal";
import { SettingsModal } from "@/components/ChatSettingModal";
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";
import VoiceChatInterface from "./VoiceChatInterface";

export default function ChatBot() {
  const { user, logout } = useAuth();
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const [files, setFiles] = useState(null);
  const currentMessageIdRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [virusFile, setVirusFile] = useState(null);
  const [virusFileUrl, setVirusFileUrl] = useState(null);
  const [reasoning, setReasoning] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { chatId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedIds, setCopiedIds] = useState({});
  const [speakIds, setSpeakIds] = useState({});
  const wsRef = useRef(null);
  const navigate = useNavigate();
  const [workingStep, setWorkingStep] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleSearch = () => {
    setIsModalOpen(true);
  };

  const signout = () => {
    localStorage.removeItem("innoreigniters_credentials");
    logout();
    navigate("/login");
  };

  const handleVirusFileUpload = async (virusFile) => {
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.readAsDataURL(virusFile); // produces "data:...;base64,XXX"
      reader.onload = async () => {
        const base64String = reader.result.split(",")[1]; // remove "data:...;base64,"

        const formData = new FormData();
        formData.append("filename", virusFile.name);
        formData.append("content_base64", base64String);

        const res = await axios.post(
          `${import.meta.env.VITE_FILE_SERVER_URL}/upload`,
          formData
        );
        console.log(res.data);

        if (res.status === 200) {
          setVirusFileUrl(res.data.download_url);
        }
      };
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  useEffect(() => {
    const credentials = JSON.parse(
      localStorage.getItem("innoreigniters_credentials")
    );
    const token = credentials?.access_token;
    const fetchChatData = async (id) => {
      try {
        const res =
          id !== undefined &&
          (await axios.get(`/chats/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }));
        if (res.status === 200) {
          setCurrentChatId(chatId);
          setMessages(res.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (chatId) {
      setCurrentChatId(chatId);
      fetchChatData(chatId);
    } else {
      setCurrentChatId(null);
      setMessages([]);
    }
  }, [chatId]);

  useEffect(() => {
    const credentials = JSON.parse(
      localStorage.getItem("innoreigniters_credentials")
    );
    const fetchChats = async () => {
      try {
        const token = credentials.access_token;
        const res = await axios.get("/chats", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (res.status === 200) {
          setChatHistory(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (credentials) fetchChats();
  }, []);

  const handleChatSelect = (unique_id) => {
    navigate(`/c/${unique_id}`);
  };

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/chat"); // Changed from 8000 to 8765
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "reasoning") {
        setIsLoading(false);
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (
            lastMessage?.role === "assistant" &&
            lastMessage.id === currentMessageIdRef.current
          ) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                reasoning: (lastMessage.reasoning || "") + msg.data,
                timestamp: new Date(),
              },
            ];
          } else {
            const newMessage = {
              id: Date.now().toString(),
              role: "assistant",
              content: "",
              reasoning: msg.data,
              timestamp: new Date(),
            };
            currentMessageIdRef.current = newMessage.id;
            return [...prev, newMessage];
          }
        });
      } else if (msg.type === "answer") {
        setIsLoading(false);
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (
            lastMessage?.role === "assistant" &&
            lastMessage.id === currentMessageIdRef.current
          ) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: lastMessage.content + msg.data,
                timestamp: new Date(),
              },
            ];
          } else {
            const newMessage = {
              id: Date.now().toString(),
              role: "assistant",
              content: msg.data,
              reasoning: "",
              timestamp: new Date(),
            };
            currentMessageIdRef.current = newMessage.id;
            return [...prev, newMessage];
          }
        });
        setWorkingStep("");
      } else if (msg.type === "title") {
        setChatHistory((prevChats) =>
          prevChats.map((chat) =>
            chat.unique_id === msg.chatId ? { ...chat, title: msg.title } : chat
          )
        );
      } else if (msg.type === "step") {
        setWorkingStep(msg.step);
      } else if (msg.type === "new_chat") {
        const newChat = {
          id: msg.id,
          title: msg.title,
          unique_id: msg.unique_id,
          lastMessage: "",
          timestamp: new Date(),
          messageCount: 1,
        };
        setChatHistory((prev) => [newChat, ...prev]);
        setCurrentChatId(newChat.unique_id);
      } else if (msg.type === "error") {
        console.error("Server error:", msg.message);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Oops, something went wrong: ${msg.message}`,
            timestamp: new Date(),
          },
        ]);
        currentMessageIdRef.current = null;
        setVirusFile(null);
        setVirusFileUrl(null);
        setFiles(null);
        setWorkingStep("");
      }
    };

    ws.onerror = (e) => console.error("WebSocket error:", e);
    ws.onclose = () => console.log("WebSocket closed");

    return () => {
      ws.close();
    };
  }, []);

  const imageFileUpload = async (e) => {
    e.preventDefault();
    setFiles(e.target.files[0]);
    const res = await uploadPicture(e.target.files[0], (progress) => {
      setUploadProgress(progress);
    });

    if (res.status) {
      setImageUrl(res.imgData);
    }
  };

  const chat = async (query) => {
    if (!query.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
      imageUrl: imageUrl,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    if (currentChatId) {
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                lastMessage: query.slice(0, 50),
                messageCount: chat.messageCount + 1,
                timestamp: new Date(),
              }
            : chat
        )
      );
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          currentChatId: currentChatId,
          query: query,
          fileUrl: virusFileUrl,
          imageUrl: imageUrl,
          includeReasoning: reasoning,
          token: JSON.parse(localStorage.getItem("innoreigniters_credentials"))
            .access_token,
        })
      );
      setVirusFile(null);
      setVirusFileUrl(null);
      setFiles(null);
      setImageUrl(null);
    } else {
      console.error("WebSocket not connected");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Error: Unable to connect to the server. Please try again.",
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      imageUrl: imageUrl,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    if (currentChatId) {
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                lastMessage: input.slice(0, 50),
                messageCount: chat.messageCount + 1,
                timestamp: new Date(),
              }
            : chat
        )
      );
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          currentChatId: currentChatId,
          query: input,
          fileUrl: virusFileUrl,
          imageUrl: imageUrl,
          includeReasoning: reasoning,
          token: JSON.parse(localStorage.getItem("innoreigniters_credentials"))
            .access_token,
        })
      );
      setVirusFile(null);
      setVirusFileUrl(null);
      setFiles(null);
      setImageUrl(null);
    } else {
      console.error("WebSocket not connected");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Error: Unable to connect to the server. Please try again.",
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    navigate("/");
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      const credentials = JSON.parse(
        localStorage.getItem("innoreigniters_credentials")
      );
      const token = credentials?.access_token;
      const res = await axios.delete(`/chat/delete/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.status === 200) {
        setChatHistory((prev) =>
          prev.filter((chat) => chat.unique_id !== chatId)
        );
        if (currentChatId === chatId) {
          handleNewChat();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleReasoning = () => {
    setReasoning(!reasoning);
  };

  const sidebarItems = [
    { icon: Search, label: "Search", shortcut: "Ctrl+K" },
    { icon: MessageSquare, label: "New Chat", active: true },
  ];

  const currentMessages = currentChatId ? messages : messages;

  const getFileIcon = (file) => {
    if (!file) return null;

    const ext = file.name.split(".").pop().toLowerCase();

    switch (ext) {
      case "pdf":
        return <FileText className="w-6 h-6 text-red-600" />;
      case "exe":
        return <FileAlert className="w-6 h-6 text-gray-800" />;
      case "doc":
      case "docx":
        return <FileText className="w-6 h-6 text-blue-600" />;
      case "txt":
        return <FileCode className="w-6 h-6 text-gray-600" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage className="w-6 h-6 text-green-600" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  const handleCopy = (content, id) => {
    navigator.clipboard.writeText(content);
    setCopiedIds((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedIds((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      print(transcript);
      // chat(transcript);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    setListening(true);
    recognitionRef.current.start();
  };

  const voiceChat = () => {
    console.log("vo");
    startListening();
    // chat(input);
  };

  // Store currently playing audios
  const audioRefs = {};

  const handleSpeak = async (message, id) => {
    if (!message) return;

    try {
      setSpeakIds((prev) => ({ ...prev, [id]: true }));

      // Axios POST request expecting a blob response
      const res = await axios.post(
        "http://localhost:8000/tts",
        { message },
        {
          responseType: "blob",
          headers: { "Content-Type": "application/json" },
        }
      );

      const blob = res.data;
      const url = URL.createObjectURL(blob);

      const audioElement = new Audio(url);
      audioRefs[id] = audioElement; // Save reference

      audioElement.onended = () => {
        setSpeakIds((prev) => ({ ...prev, [id]: false }));
        delete audioRefs[id]; // Clean up
      };

      await audioElement.play();
    } catch (error) {
      console.error("Error with TTS playback:", error);
      setSpeakIds((prev) => ({ ...prev, [id]: false }));
      delete audioRefs[id];
    }
  };

  // Stop speaking
  const stopSpeak = (id) => {
    const audio = audioRefs[id];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setSpeakIds((prev) => ({ ...prev, [id]: false }));
      delete audioRefs[id];
    }
  };

  const [isVoiceChat, setIsVoiceChat] = useState(false);

  const closeVoiceChat = () => {
    setIsVoiceChat(!isVoiceChat);
  };

  return (
    <>
      {isVoiceChat ? (
        <VoiceChatInterface onClose={closeVoiceChat} voiceChat={voiceChat} />
      ) : (
        <div className="flex h-screen bg-background border">
          <ChatSearchModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            chats={chatHistory}
          />

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />

          <div>
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <div
              className={`${
                sidebarOpen ? "w-72" : "w-0"
              } transition-all duration-300 ease-in-out overflow-hidden border-r bg-background md:relative fixed left-0 top-0 h-full z-50 md:z-auto`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-16 logo-glow flex items-center justify-center">
                      <img
                        src="/logo_light.png"
                        alt="Logo"
                        className="object-contain w-12 h-12 dark:hidden rounded-full "
                      />
                      <img
                        src="/logo_dark.png"
                        alt="Logo"
                        className="object-contain w-16 h-16 hidden dark:block"
                      />
                    </div>
                    <span className="text-lg font-medium">InnoIgnitersAI</span>
                  </div>
                </div>

                <div className="px-3 space-y-1">
                  {sidebarItems.map((item) => (
                    <div
                      key={item.label}
                      className={`sidebar-item flex items-center justify-between px-3 py-2 text-sm cursor-pointer ${
                        item.active ? "active" : ""
                      }`}
                      onClick={
                        item.label === "New Chat"
                          ? handleNewChat
                          : item.label === "Search"
                          ? handleSearch
                          : undefined
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.shortcut && (
                        <span className="text-xs text-muted-foreground">
                          {item.shortcut}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex-1 px-3 mt-6">
                  <div className="text-xs font-medium text-muted-foreground mb-3 px-3">
                    Today
                  </div>
                  <ScrollArea className="space-y-1 scrollbar-thin">
                    {chatHistory.map((chat) => (
                      <div
                        key={chat.id}
                        className={`sidebar-item w-56 flex items-center justify-between px-3 py-2 cursor-pointer group ${
                          currentChatId === chat.unique_id
                            ? "bg-gray-200 rounded-xl dark:bg-slate-700"
                            : ""
                        }`}
                        onClick={() => handleChatSelect(chat.unique_id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm w-44 truncate">{chat.title}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) =>
                                handleDeleteChat(chat.unique_id, e)
                              }
                              className="text-red-600 focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </ScrollArea>
                </div>

                <div className="p-3 border-t">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="sidebar-item flex items-center space-x-3 px-3 py-2 cursor-pointer">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user?.image || ""} />
                          <AvatarFallback>
                            <User className="w-3 h-3" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">
                          {user?.email?.split("@")[0] || "User"}
                        </span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {!isMobile && (
                        <DropdownMenuItem
                          onClick={() => setIsSettingsOpen(true)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2"
                >
                  <div className="w-4 h-4 flex flex-col space-y-1">
                    <div className="w-full h-0.5 bg-current"></div>
                    <div className="w-full h-0.5 bg-current"></div>
                    <div className="w-full h-0.5 bg-current"></div>
                  </div>
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <div variant="ghost" size="sm">
                  <ThemeToggle />
                </div>
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 scrollbar-thin max-h-[480px]">
              <div className="max-w-4xl mx-auto px-4">
                {currentMessages.length === 0 && !currentChatId && (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-40 h-40 logo-glow">
                      <img
                        src="/logo_dark.png"
                        alt="Logo"
                        className="object-contain w-40 h-40 hidden dark:block"
                      />
                      <img
                        src="/logo_light.png"
                        alt="Logo"
                        className="object-contain w-40 h-40 block dark:hidden"
                      />
                    </div>
                    <h1 className="text-4xl font-light mb-4">
                      Welcome back, {user?.email?.split("@")[0] || "there"}!
                    </h1>
                    <p className="text-muted-foreground">
                      How can InnoIgnitersAI help you today?
                    </p>
                  </div>
                )}
                <div className="space-y-6 py-6">
                  {currentMessages.map((message, index) => (
                    <div key={index} className="flex space-x-4 message-enter">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback
                          className={
                            message.role === "user"
                              ? "bg-blue-500"
                              : "bg-foreground"
                          }
                        >
                          {message.role === "user" ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-background" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-5">
                        <div className="overflow-x-auto">
                          {message.reasoning && (
                            <div className="mb-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-3xl">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Reasoning:
                              </h4>
                              <ReactMarkdown
                                remarkPlugins={[remarkMath, remarkGfm]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                  p: ({ ...props }) => (
                                    <p
                                      className="mb-2 leading-relaxed text-gray-600 dark:text-gray-400"
                                      {...props}
                                    />
                                  ),
                                }}
                              >
                                {typeof message.reasoning === "string"
                                  ? message.reasoning
                                  : ""}
                              </ReactMarkdown>
                            </div>
                          )}

                          <div className="max-w-3xl">
                            <ReactMarkdown
                              remarkPlugins={[remarkMath, remarkGfm]}
                              rehypePlugins={[rehypeKatex]}
                              components={{
                                h1: ({ ...props }) => (
                                  <h5
                                    className="mt-4 my-2 text-2xl font-semibold text-slate-800 dark:text-gray-200 mb-2"
                                    {...props}
                                  />
                                ),
                                h2: ({ ...props }) => (
                                  <h5
                                    className="mt-4 my-2 text-xl font-semibold text-slate-800 dark:text-gray-200 mb-2"
                                    {...props}
                                  />
                                ),
                                h3: ({ ...props }) => (
                                  <h5
                                    className="mt-4 my-2 text-lg font-semibold text-slate-800 dark:text-gray-200 mb-2"
                                    {...props}
                                  />
                                ),
                                strong: ({ ...props }) => (
                                  <strong
                                    className="font-semibold"
                                    {...props}
                                  />
                                ),
                                hr: ({ ...props }) => (
                                  <div className="relative my-8">
                                    <hr
                                      className="border-gray-300 dark:border-gray-600"
                                      {...props}
                                    />
                                  </div>
                                ),
                                code({
                                  inline,
                                  className,
                                  children,
                                  ...props
                                }) {
                                  const match = /language-(\w+)/.exec(
                                    className || ""
                                  );
                                  return !inline && match ? (
                                    <div className="relative my-4 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                                      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 dark:text-gray-100 text-black text-sm px-3 py-1">
                                        <span>{match[1]}</span>
                                        <button
                                          className="text-xs dark:text-white dark:bg-gray-700 bg-transparent text-black hover:text-white px-2 py-1 rounded dark:hover:bg-gray-600 hover:bg-gray-900"
                                          onClick={() => {
                                            navigator.clipboard.writeText(
                                              String(children).trim()
                                            );
                                          }}
                                        >
                                          Copy
                                        </button>
                                      </div>
                                      <SyntaxHighlighter
                                        style={oneDark}
                                        language={match[1]}
                                        PreTag="div"
                                        {...props}
                                      >
                                        {String(children).replace(/\n$/, "")}
                                      </SyntaxHighlighter>
                                    </div>
                                  ) : (
                                    <code
                                      className="bg-green-100 italic font-semibold dark:bg-gray-700 px-1 py-0.5 rounded text-sm"
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  );
                                },
                                table: ({ ...props }) => (
                                  <table
                                    className="min-w-full border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden"
                                    {...props}
                                  />
                                ),
                                th: ({ ...props }) => (
                                  <th
                                    className="bg-white dark:bg-gray-800 text-left px-4 py-2 border-b border-gray-300 dark:border-gray-600 font-medium"
                                    {...props}
                                  />
                                ),
                                td: ({ ...props }) => (
                                  <td
                                    className="px-4 py-2 border-b border-gray-300 dark:border-gray-700"
                                    {...props}
                                  />
                                ),
                                tr: ({ ...props }) => (
                                  <tr
                                    className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-700 dark:even:bg-gray-700"
                                    {...props}
                                  />
                                ),
                                p: ({ ...props }) => (
                                  <p
                                    className="mb-2 leading-loose text-gray-800 dark:text-gray-200"
                                    {...props}
                                  />
                                ),
                                li: ({ ...props }) => (
                                  <li
                                    className="mb-1 leading-loose text-gray-800 dark:text-gray-200 list-disc ml-6"
                                    {...props}
                                  />
                                ),
                              }}
                            >
                              {typeof message.content === "string"
                                ? message.content.replace(
                                    /\[([^\]]+)\]/g,
                                    (_, math) => `$$${math}$$`
                                  )
                                : ""}
                            </ReactMarkdown>
                            {copiedIds[message.id] ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={"cursor-pointer"}
                              >
                                <Check className="w-4 h-4 text-gray-600" />
                              </Button>
                            ) : (
                              <Button
                                onClick={() =>
                                  handleCopy(message.content, message.id)
                                }
                                variant="ghost"
                                size="sm"
                                className={"cursor-pointer"}
                              >
                                <Copy className="w-4 h-4 text-gray-600" />
                              </Button>
                            )}

                            {speakIds[message.id] ? (
                              <Button
                                variant={"ghost"}
                                onClick={() => stopSpeak(message.id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                              >
                                <CirclePause className={`w-5 h-5 `} />
                              </Button>
                            ) : (
                              <Button
                                variant={"ghost"}
                                onClick={() =>
                                  handleSpeak(message.content, message.id)
                                }
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                              >
                                <SpeakerWaveIcon className={`w-5 h-5`} />
                              </Button>
                            )}
                          </div>
                          {message.imageUrl && (
                            <div className="h-64 w-64">
                              <img
                                src={message.imageUrl}
                                alt={"User's image"}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex space-x-4">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-foreground">
                          <Bot className="w-4 h-4 text-background" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex space-x-1 items-center">
                          <p className="text-muted-foreground text-sm">
                            {workingStep ? workingStep : "Processing"}
                            <span className="animate-pulse text-2xl pl-1">
                              ...
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* <div ref={messagesEndRef} /> */}
            </ScrollArea>

            <div className="p-4 py-0 ">
              <div className="max-w-3xl mx-auto">
                <div className="flex gap-2 px-2 mb-2 h-15">
                  {virusFile && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border flex items-center justify-center">
                      {getFileIcon(virusFile)}
                      <button
                        type="button"
                        onClick={() => setVirusFile(null)}
                        className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 hover:bg-black"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}

                  {files && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                      <img
                        src={URL.createObjectURL(files)}
                        alt={files.name}
                        className={`object-cover w-full h-full transition-all duration-500 
        ${uploadProgress < 100 ? "blur-sm opacity-50" : "blur-0 opacity-100"}`}
                      />

                      {uploadProgress < 100 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs">
                          {uploadProgress}%
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setFiles(null)}
                        className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 hover:bg-black"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex items-center px-4 py-3 space-x-2 border rounded-xl bg-background"
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={imageFileUpload}
                    className="hidden"
                    id="file-upload"
                  />

                  <input
                    type="file"
                    accept=""
                    multiple
                    onChange={(e) => {
                      setVirusFile(e.target.files[0]);
                      handleVirusFileUpload(e.target.files[0]);
                    }}
                    className="hidden"
                    id="virus-upload"
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      className="rounded-full w-4 h-4 p-0"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() =>
                          document.getElementById("file-upload").click()
                        }
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Image Upload
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() =>
                          document.getElementById("virus-upload").click()
                        }
                      >
                        <FileTextIcon className="w-4 h-4 mr-2" />
                        File Upload
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`rounded-4xl ${
                      reasoning
                        ? "bg-gray-900 text-white dark:bg-slate-800"
                        : ""
                    }`}
                    onClick={() => {
                      toggleReasoning();
                    }}
                  >
                    <div
                      className={`flex items-center space-x-1 justify-center cursor-pointer }`}
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span className="text-sm">Reasoning</span>
                    </div>
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      // startListening();
                      setIsVoiceChat(!isVoiceChat);
                    }}
                    size="sm"
                    className="rounded-full w-8 h-8 p-0"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={(!input.trim() && files) || isLoading}
                    className="rounded-full w-8 h-8 p-0"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
