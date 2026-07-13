import type { TicketSource } from "./ticket";

export interface AppNotification {
  id: string;
  title: string;
  snippet: string;
  source: TicketSource;
  ticketId: string;
  createdAt: string;
  read: boolean;
}
