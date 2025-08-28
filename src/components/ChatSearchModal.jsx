"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock } from "lucide-react";
import { cn } from "@/components/lib/utils";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";

export function ChatSearchModal({ isOpen, onClose, chats }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [chats, searchQuery]);

  const handleChatSelect = (chat) => {
    navigate(`/c/${chat.unique_id}`);
    onClose();
  };

  function formatTimestamp(isoString) {
    const date = new Date(isoString);
    if (isNaN(date)) return "Invalid date";

    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  }

  const groupedChats = filteredChats.reduce((groups, chat) => {
    const group = groups[chat.timestamp] || [];
    group.push(chat);
    groups[chat.timestamp] = group;
    return groups;
  }, {});

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle />
      <DialogContent className="sm:max-w-md p-0 bg-card border-border overflow-hidden">
        <DialogDescription />
        <div className="flex flex-col h-[500px]">
          {/* Header with search */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
                autoFocus
              />
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {Object.entries(groupedChats).map(([timestamp, chats]) => (
              <div key={timestamp} className="p-2">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />

                  {formatTimestamp(timestamp)}
                </div>
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <Button
                      key={chat.id}
                      variant="ghost"
                      onClick={() => handleChatSelect(chat)}
                      className={cn(
                        "w-full justify-start gap-3 h-10 text-left font-normal",
                        "text-foreground hover:bg-accent truncate"
                      )}
                    >
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                      <span className="truncate">{chat.title}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            {filteredChats.length === 0 && searchQuery && (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No chats found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
