import type { ChatContact, ChatMessage } from "./types";

export const DEFAULT_CHAT_CONTACT_ID = "lindsey-curtis";

export const chatContacts: ChatContact[] = [
  {
    id: "kaiya-george",
    name: "Kaiya George",
    role: "Project Manager",
    avatar: "/images/user/user-18.jpg",
    presence: "online",
    lastActive: "15 mins",
  },
  {
    id: "lindsey-curtis",
    name: "Lindsey Curtis",
    role: "Designer",
    avatar: "/images/user/user-17.jpg",
    presence: "online",
    lastActive: "30 mins",
  },
  {
    id: "zain-geidt",
    name: "Zain Geidt",
    role: "Content Writer",
    avatar: "/images/user/user-19.jpg",
    presence: "online",
    lastActive: "45 mins",
  },
  {
    id: "carla-george",
    name: "Carla George",
    role: "Front-end Developer",
    avatar: "/images/user/user-05.jpg",
    presence: "away",
    lastActive: "2 days",
  },
  {
    id: "abram-schleifer",
    name: "Abram Schleifer",
    role: "Digital Marketer",
    avatar: "/images/user/user-20.jpg",
    presence: "online",
    lastActive: "1 hour",
  },
  {
    id: "lincoln-donin",
    name: "Lincoln Donin",
    role: "Product Designer",
    avatar: "/images/user/user-34.jpg",
    presence: "online",
    lastActive: "3 days",
  },
  {
    id: "erin-geidthem",
    name: "Erin Geidthem",
    role: "Copywriter",
    avatar: "/images/user/user-35.jpg",
    presence: "online",
    lastActive: "5 days",
  },
  {
    id: "alena-baptista",
    name: "Alena Baptista",
    role: "SEO Expert",
    avatar: "/images/user/user-36.jpg",
    presence: "offline",
    lastActive: "2 hours",
  },
  {
    id: "wilium-vamos",
    name: "Wilium Vamos",
    role: "Content Writer",
    avatar: "/images/user/user-37.jpg",
    presence: "online",
    lastActive: "5 days",
  },
];

export const initialChatMessages: Record<string, ChatMessage[]> = {
  "kaiya-george": [
    {
      id: "kaiya-1",
      sender: "contact",
      text: "I want to make an appointment tomorrow from 2:00 to 5:00pm.",
      timestamp: "Kaiya George, 15 mins",
    },
  ],
  "lindsey-curtis": [
    {
      id: "lindsey-1",
      sender: "contact",
      text: "I want to make an appointment tomorrow from 2:00 to 5:00pm.",
      timestamp: "Lindsey Curtis, 30 mins",
    },
    {
      id: "lindsey-2",
      sender: "me",
      text: "If I don't like something, I'll stay away from it.",
      timestamp: "2 hours ago",
    },
    {
      id: "lindsey-3",
      sender: "contact",
      text: "I want more detailed information.",
      timestamp: "Lindsey Curtis, 2 hours ago",
    },
    {
      id: "lindsey-4",
      sender: "me",
      text: "They got there early, and got really good seats.",
      timestamp: "2 hours ago",
    },
    {
      id: "lindsey-5",
      sender: "contact",
      image: "/images/chat/chat.jpg",
      text: "Please preview the image.",
      timestamp: "Lindsey Curtis, 2 hours ago",
    },
  ],
  "zain-geidt": [
    {
      id: "zain-1",
      sender: "contact",
      text: "Can you share the approved content plan today?",
      timestamp: "45 mins",
    },
  ],
  "carla-george": [
    {
      id: "carla-1",
      sender: "contact",
      text: "I pushed the new UI branch, please review it when you can.",
      timestamp: "2 days",
    },
  ],
  "abram-schleifer": [
    {
      id: "abram-1",
      sender: "contact",
      text: "Campaign CTR moved up by 1.8%.",
      timestamp: "1 hour",
    },
  ],
  "lincoln-donin": [
    {
      id: "lincoln-1",
      sender: "contact",
      text: "Let's lock the final wireframe before standup.",
      timestamp: "3 days",
    },
  ],
  "erin-geidthem": [
    {
      id: "erin-1",
      sender: "contact",
      text: "Draft copy for the landing hero is ready.",
      timestamp: "5 days",
    },
  ],
  "alena-baptista": [
    {
      id: "alena-1",
      sender: "contact",
      text: "Need updated keyword list for the new product line.",
      timestamp: "2 hours",
    },
  ],
  "wilium-vamos": [
    {
      id: "wilium-1",
      sender: "contact",
      text: "I can deliver two long-form posts by Friday.",
      timestamp: "5 days",
    },
  ],
};
