export type TicketSource = "whatsapp" | "gmail" | "website";
export type TicketStatus = "review" | "progress" | "done";

export interface TicketMessage {
  id: string;
  externalId?: number | string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  subject?: string;
  content: string;
  createdAt: string;
  direction?: "in" | "out";
  sentStatus?: string | null;
  pendingAt?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  attachments?: { name: string; url: string }[];
  replies?: TicketMessage[];
  quotedExternalId?: number | string | null;
  quotedMessage?: { authorName: string; content: string };
}

export interface Ticket {
  id: string;
  externalIds?: {
    websiteTicketId?: number;
    whatsappTicketId?: number;
    whatsappRoomChatId?: number;
    whatsappMessageChatId?: number;
  };
  source: TicketSource;
  subject: string;
  snippet: string;
  senderName: string;
  senderHandle: string;
  senderAvatar?: string;
  updatedAt: string;
  status?: TicketStatus;
  unread?: boolean;
  isSavedAsTicket: boolean;
  isSynced?: boolean;
  isDetailsLoaded?: boolean;
  isPinned?: boolean;
  messages: TicketMessage[];
}
