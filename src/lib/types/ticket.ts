export type TicketSource = "whatsapp" | "gmail" | "website";
export type TicketStatus = "blast" | "review" | "progress" | "done";

export interface TicketMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  subject?: string;
  content: string;
  createdAt: string;
  direction?: "in" | "out";
  attachments?: { name: string; url: string }[];
  replies?: TicketMessage[];
  quotedMessage?: { authorName: string; content: string };
}

export interface Ticket {
  id: string;
  source: TicketSource;
  subject: string;
  snippet: string;
  senderName: string;
  senderHandle: string;
  senderAvatar?: string;
  updatedAt: string;
  status: TicketStatus;
  isSavedAsTicket: boolean;
  isPinned?: boolean;
  messages: TicketMessage[];
}
