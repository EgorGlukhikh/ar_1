"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface User { id: string; name: string | null; image: string | null; role?: string }
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: User;
  receiver: User;
}

interface Props {
  currentUserId: string;
  messages: Message[];
  staff: (User & { role: string })[];
}

function getConversationPartner(msg: Message, currentUserId: string): User {
  return msg.senderId === currentUserId ? msg.receiver : msg.sender;
}

const roleLabel: Record<string, string> = {
  ADMIN: "Администратор",
  CURATOR: "Куратор",
  AUTHOR: "Автор",
};

export function MessengerClient({ currentUserId, messages, staff }: Props) {
  const [allMessages, setAllMessages] = useState(messages);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(
    messages[0] ? getConversationPartner(messages[0], currentUserId).id : null
  );
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Unique conversation partners
  const conversationMap = new Map<string, { partner: User; lastMsg: Message }>();
  for (const msg of allMessages) {
    const partner = getConversationPartner(msg, currentUserId);
    if (!conversationMap.has(partner.id)) {
      conversationMap.set(partner.id, { partner, lastMsg: msg });
    }
  }

  // Add staff not in conversations
  for (const s of staff) {
    if (!conversationMap.has(s.id)) {
      conversationMap.set(s.id, {
        partner: s,
        lastMsg: null as unknown as Message,
      });
    }
  }

  const conversations = Array.from(conversationMap.values());

  const activeMessages = allMessages.filter(
    (m) =>
      (m.senderId === currentUserId && m.receiverId === activePartnerId) ||
      (m.receiverId === currentUserId && m.senderId === activePartnerId)
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length]);

  const sendMessage = async (content?: string) => {
    const msgContent = content ?? text.trim();
    if (!msgContent || !activePartnerId) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activePartnerId, content: msgContent }),
      });
      const msg = await res.json();
      setAllMessages((p) => [
        ...p,
        {
          ...msg,
          sender: { id: currentUserId, name: "Вы", image: null },
          receiver: { id: activePartnerId, name: "...", image: null },
        },
      ]);
      setText("");
    } finally {
      setSending(false);
    }
  };

  const sendPaymentLink = () => {
    const link = prompt("Введите ссылку на оплату:");
    if (link) sendMessage(`💳 Ссылка для оплаты: ${link}`);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-lg border bg-white">
      {/* Left: Conversation list */}
      <div className="w-64 shrink-0 overflow-y-auto border-r">
        <div className="p-3 font-semibold text-sm border-b">Сообщения</div>
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-200" />
            Нет диалогов
          </div>
        ) : (
          conversations.map(({ partner, lastMsg }) => {
            const staffUser = staff.find((s) => s.id === partner.id);
            return (
              <button
                key={partner.id}
                onClick={() => setActivePartnerId(partner.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-gray-50",
                  activePartnerId === partner.id && "bg-blue-50"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs">
                    {partner.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{partner.name}</p>
                  {staffUser && (
                    <p className="text-xs text-muted-foreground">
                      {roleLabel[staffUser.role] ?? staffUser.role}
                    </p>
                  )}
                  {lastMsg && (
                    <p className="text-xs text-muted-foreground truncate">
                      {lastMsg.content}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Right: Chat */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {activePartnerId ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeMessages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      isMe ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs rounded-2xl px-4 py-2 text-sm",
                        isMe
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-muted-foreground hover:text-blue-600"
                onClick={sendPaymentLink}
                title="Отправить ссылку на оплату"
              >
                <CreditCard className="h-4 w-4" />
              </Button>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Написать сообщение..."
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                className="flex-1"
              />
              <Button
                size="sm"
                className="shrink-0"
                onClick={() => sendMessage()}
                disabled={!text.trim() || sending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-200" />
              <p>Выберите диалог</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
