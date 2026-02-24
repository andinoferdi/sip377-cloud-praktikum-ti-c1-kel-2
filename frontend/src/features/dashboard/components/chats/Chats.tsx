"use client";

import { useMemo, useState } from "react";
import ChatConversation from "./ChatConversation";
import ChatSidebar from "./ChatSidebar";
import {
  chatContacts,
  DEFAULT_CHAT_CONTACT_ID,
  initialChatMessages,
} from "./chat-data";
import type { ChatMessage } from "./types";

function cloneInitialMessages() {
  return Object.fromEntries(
    Object.entries(initialChatMessages).map(([contactId, messages]) => [
      contactId,
      [...messages],
    ])
  );
}

export default function Chats() {
  const [activeContactId, setActiveContactId] = useState(DEFAULT_CHAT_CONTACT_ID);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);
  const [messagesByContact, setMessagesByContact] = useState<
    Record<string, ChatMessage[]>
  >(() => cloneInitialMessages());

  const filteredContacts = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    if (!normalizedSearch) return chatContacts;
    return chatContacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(normalizedSearch) ||
        contact.role.toLowerCase().includes(normalizedSearch)
    );
  }, [searchTerm]);

  const activeContact =
    chatContacts.find((contact) => contact.id === activeContactId) ??
    chatContacts[0];

  const activeMessages = messagesByContact[activeContact.id] ?? [];

  const handleSelectContact = (contactId: string) => {
    setActiveContactId(contactId);
    setIsMobileSidebarOpen(false);
  };

  const handleSendMessage = () => {
    const cleanedMessage = messageInput.trim();
    if (!cleanedMessage) return;

    const newMessage: ChatMessage = {
      id: `${activeContact.id}-${Date.now()}`,
      sender: "me",
      text: cleanedMessage,
      timestamp: "Just now",
    };

    setMessagesByContact((prevMessages) => ({
      ...prevMessages,
      [activeContact.id]: [...(prevMessages[activeContact.id] ?? []), newMessage],
    }));
    setMessageInput("");
  };

  return (
    <div className="h-[calc(100vh-150px)] overflow-hidden sm:h-[calc(100vh-174px)]">
      <div className="flex h-full flex-col gap-6 xl:flex-row xl:gap-5">
        <div
          className={`${
            isMobileSidebarOpen ? "flex" : "hidden"
          } flex-col xl:flex xl:w-1/4`}
        >
          <ChatSidebar
            contacts={filteredContacts}
            activeContactId={activeContact.id}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onSelectContact={handleSelectContact}
            onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
          />
        </div>

        <div
          className={`${
            isMobileSidebarOpen ? "hidden" : "flex"
          } h-full flex-col xl:flex xl:w-3/4`}
        >
          <ChatConversation
            contact={activeContact}
            messages={activeMessages}
            messageInput={messageInput}
            onMessageInputChange={setMessageInput}
            onSendMessage={handleSendMessage}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />
        </div>
      </div>
    </div>
  );
}
