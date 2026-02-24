export type ChatPresence = "online" | "away" | "offline";

export type ChatSender = "me" | "contact";

export type ChatContact = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  presence: ChatPresence;
  lastActive: string;};

export type ChatMessage = {
  id: string;
  sender: ChatSender;
  text?: string;
  image?: string;
  timestamp: string;};
