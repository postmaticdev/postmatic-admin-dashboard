export type TicketSource = "whatsapp" | "gmail" | "website";
export type TicketStatus = "review" | "progress" | "done";
export type TicketViewKind = "conversation" | "ticket";

export interface TicketReference {
  id: number;
  subject: string;
  body?: string;
  status?: TicketStatus;
  isPinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
  messageExternalId?: number;
}

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
  errorMessage?: string | null;
  pendingAt?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  canResend?: boolean;
  attachments?: { assetId?: number | string; name: string; url: string; type?: string }[];
  replies?: TicketMessage[];
  quotedExternalId?: number | string | null;
  quotedMessage?: { authorName: string; content: string };
  ticketReferences?: TicketReference[];
}

export interface Ticket {
  id: string;
  externalIds?: {
    websiteTicketId?: number;
    whatsappTicketId?: number;
    whatsappRoomChatId?: number;
    whatsappMessageChatId?: number;
    whatsappTicketMessageChatId?: number;
    emailThreadId?: number;
    emailTicketId?: number;
    emailMessageId?: number;
  };
  viewKind?: TicketViewKind;
  source: TicketSource;
  subject: string;
  snippet: string;
  senderName: string;
  senderHandle: string;
  senderAvatar?: string;
  updatedAt: string;
  lastMessageAt?: string;
  status?: TicketStatus;
  unread?: boolean;
  unreadCount?: number;
  isSavedAsTicket: boolean;
  isSynced?: boolean;
  isDetailsLoaded?: boolean;
  isPinned?: boolean;
  ticketHistory?: TicketReference[];
  focusedMessageExternalId?: number;
  messages: TicketMessage[];
}
