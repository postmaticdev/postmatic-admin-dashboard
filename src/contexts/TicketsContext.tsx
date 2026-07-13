import { createContext, useCallback, useContext, useMemo, useState, useRef, type ReactNode } from "react";
import { MOCK_TICKETS } from "@/lib/mock/tickets";
import type { Ticket, TicketSource, TicketStatus, TicketMessage } from "@/lib/types/ticket";

interface TicketsContextValue {
  tickets: Ticket[];
  getBySource: (source: TicketSource) => Ticket[];
  getSaved: () => Ticket[];
  getById: (id: string) => Ticket | undefined;
  markAsTicket: (id: string, opts?: { subject?: string }) => void;
  unmarkAsTicket: (id: string) => void;
  togglePinTicket: (id: string) => void;
  createTicket: (ticket: Omit<Ticket, "id" | "updatedAt" | "isSavedAsTicket" | "status"> & { status?: TicketStatus; isSavedAsTicket?: boolean }) => Ticket;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  addMessage: (ticketId: string, message: Omit<TicketMessage, "id" | "createdAt">) => void;
  getDraft: (key: string) => any;
  setDraft: (key: string, val: any) => void;
}

const TicketsContext = createContext<TicketsContextValue | null>(null);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const draftsRef = useRef<Record<string, any>>({});

  const getDraft = useCallback((key: string) => draftsRef.current[key], []);
  const setDraft = useCallback((key: string, val: any) => {
    draftsRef.current[key] = val;
  }, []);

  const markAsTicket = useCallback((id: string, opts?: { subject?: string }) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isSavedAsTicket: true,
              subject: opts?.subject?.trim() ? opts.subject.trim() : t.subject,
            }
          : t,
      ),
    );
  }, []);

  const unmarkAsTicket = useCallback((id: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isSavedAsTicket: false,
            }
          : t,
      ),
    );
  }, []);

  const togglePinTicket = useCallback((id: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isPinned: !t.isPinned,
            }
          : t,
      ),
    );
  }, []);

  const createTicket = useCallback((newTicketData: Omit<Ticket, "id" | "updatedAt" | "isSavedAsTicket" | "status"> & { status?: TicketStatus; isSavedAsTicket?: boolean }) => {
    const newId = `t-${newTicketData.source}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newTicket: Ticket = {
      status: newTicketData.status || "review",
      ...newTicketData,
      id: newId,
      updatedAt: new Date().toISOString(),
      isSavedAsTicket: newTicketData.isSavedAsTicket ?? false,
    };
    setTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  }, []);

  const updateTicketStatus = useCallback((id: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              updatedAt: new Date().toISOString(),
            }
          : t,
      ),
    );
  }, []);

  const addMessage = useCallback((ticketId: string, messageData: Omit<TicketMessage, "id" | "createdAt">) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              snippet: messageData.content.substring(0, 100),
              updatedAt: new Date().toISOString(),
              messages: [
                ...t.messages,
                {
                  ...messageData,
                  id: `m-${Date.now()}`,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : t,
      ),
    );
  }, []);

  const value = useMemo<TicketsContextValue>(
    () => ({
      tickets,
      getBySource: (source) => tickets.filter((t) => t.source === source),
      getSaved: () => tickets.filter((t) => t.isSavedAsTicket),
      getById: (id) => tickets.find((t) => t.id === id),
      markAsTicket,
      unmarkAsTicket,
      togglePinTicket,
      createTicket,
      updateTicketStatus,
      addMessage,
      getDraft,
      setDraft,
    }),
    [tickets, markAsTicket, unmarkAsTicket, togglePinTicket, createTicket, updateTicketStatus, addMessage, getDraft, setDraft],
  );

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>;
}

export function useTickets() {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used inside TicketsProvider");
  return ctx;
}
