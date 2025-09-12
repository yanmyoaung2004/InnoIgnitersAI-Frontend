"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  X,
  Settings,
  Bell,
  User,
  Puzzle,
  Shield,
  Lock,
  UserCircle,
  Play,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const settingsItems = [
  { id: "general", label: "General", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Lock },
  { id: "account", label: "Account", icon: UserCircle },
];

export function SettingsModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState("general");
  const [showFollowUpSuggestions, setShowFollowUpSuggestions] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* <DialogTitle/> */}
      <DialogContent className="max-w-4xl h-[600px] p-0 bg-background border border-border">
        {/* <DialogDescription/> */}
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-muted/30 border-r border-border p-4">
            <div className="flex items-center justify-between mb-6"></div>

            <nav className="space-y-1">
              {settingsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeSection === item.id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeSection === "general" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">
                  General
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Theme
                    </label>
                    <ThemeToggle />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Language
                    </label>
                    <Select defaultValue="auto-detect">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto-detect">Auto-detect</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="myanmar">Myanmar</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Spoken language
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        For best results, select the language you mainly speak.
                        If it's not listed, it may still be supported via
                        auto-detection.
                      </p>
                    </div>
                    <Select defaultValue="auto-detect">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto-detect">Auto-detect</SelectItem>
                        <SelectItem value="myanmar">Myanmar</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    {/*<label className="text-sm font-medium text-foreground">
                      Voice
                    </label>
                     <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-transparent"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Play
                      </Button>
                      <Select defaultValue="sol">
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sol">Sol</SelectItem>
                          <SelectItem value="luna">Luna</SelectItem>
                          <SelectItem value="nova">Nova</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>*/}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Show follow up suggestions in chats
                    </label>
                    <Switch
                      checked={showFollowUpSuggestions}
                      onCheckedChange={setShowFollowUpSuggestions}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection !== "general" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground capitalize">
                  {activeSection.replace("-", " ")}
                </h2>
                <p className="text-muted-foreground">
                  Settings for {activeSection.replace("-", " ")} will be
                  available here.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
