import { Fragment, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Paperclip,
  Send,
  X,
  FileText,
  CornerUpLeft,
  Image as ImageIcon,
  Video as VideoIcon,
  BookmarkPlus,
  History,
  LocateFixed,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "../StatusBadge";
import { TicketStatusSelector } from "../TicketStatusSelector";
import { TicketConfirmationDialog } from "../TicketConfirmationDialog";
import { useTickets } from "@/contexts/TicketsContext";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils/date";
import { uploadCustomerServiceAttachment } from "@/lib/customer-service-api";
import type { Ticket, TicketMessage, TicketReference } from "@/lib/types/ticket";

interface AttachedFile {
  name: string;
  url: string;
  type: string;
}

interface WhatsappDraft {
  text?: string;
  attachments?: AttachedFile[];
}

interface TicketMessageTarget {
  message: TicketMessage;
  externalId: number;
}

function getMessageDateKey(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatMessageDateSeparator(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfMessageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfMessageDay) / 86_400_000);

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDeliveryLabel(message: TicketMessage) {
  const status = message.sentStatus?.toLowerCase();

  if (message.readAt || status === "read") return "Dibaca";
  if (message.deliveredAt || status === "delivered") return "Tersampaikan";
  if (message.sentAt || status === "sent" || status === "success") return "Terkirim";
  if (
    message.pendingAt ||
    status === "pending" ||
    status === "enqueued" ||
    status === "queued" ||
    status === "scheduled"
  ) {
    return "Pending";
  }
  if (status === "failed" || status === "error") return "Gagal";

  return status || "";
}

function getTicketSubjectDefault(ticket: Ticket, target: TicketMessageTarget | null) {
  const messageText = target?.message.content.trim();
  if (messageText) return messageText.slice(0, 80);

  return ticket.subject;
}

function mergeTicketReferences(
  references: Array<TicketReference | null | undefined>,
  activeTicketId?: number,
) {
  const byId = new Map<number, TicketReference>();

  references.forEach((reference) => {
    if (!reference) return;

    const existing = byId.get(reference.id);
    byId.set(reference.id, {
      ...existing,
      ...reference,
      subject: reference.subject || existing?.subject || `Ticket #${reference.id}`,
      body: reference.body || existing?.body,
      status: reference.status ?? existing?.status,
      isPinned: reference.isPinned ?? existing?.isPinned,
      createdAt: reference.createdAt ?? existing?.createdAt,
      updatedAt: reference.updatedAt ?? existing?.updatedAt,
      messageExternalId: reference.messageExternalId ?? existing?.messageExternalId,
    });
  });

  return [...byId.values()].sort((a, b) => {
    if (a.id === activeTicketId) return -1;
    if (b.id === activeTicketId) return 1;

    const aTime = new Date(a.createdAt ?? a.updatedAt ?? "").getTime();
    const bTime = new Date(b.createdAt ?? b.updatedAt ?? "").getTime();

    if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
      return bTime - aTime;
    }

    return b.id - a.id;
  });
}

function whatsappTicketToReference(ticket: Ticket): TicketReference | null {
  const id = ticket.externalIds?.whatsappTicketId;
  if (id == null) return null;

  const existingReference = ticket.ticketHistory?.find((reference) => reference.id === id);

  return {
    id,
    subject: ticket.subject || existingReference?.subject || `Ticket #${id}`,
    body: existingReference?.body || ticket.snippet,
    status: ticket.status ?? existingReference?.status,
    isPinned: ticket.isPinned ?? existingReference?.isPinned,
    createdAt: existingReference?.createdAt,
    updatedAt: ticket.updatedAt ?? existingReference?.updatedAt,
    messageExternalId:
      ticket.focusedMessageExternalId ??
      ticket.externalIds?.whatsappTicketMessageChatId ??
      existingReference?.messageExternalId,
  };
}

interface WhatsappChatViewProps {
  ticket: Ticket;
  onSelectTicket?: (id: string) => void;
}

export function WhatsappChatView({ ticket, onSelectTicket }: WhatsappChatViewProps) {
  const {
    addMessage,
    getDraft,
    markAsTicket,
    openWhatsappTicketReference,
    refreshWhatsappRoomDisplayInfo,
    resendWhatsappMessage,
    setDraft,
    tickets: allTickets,
  } = useTickets();
  const draftKey = `wa-reply-${ticket.id}`;

  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [replyingTo, setReplyingTo] = useState<TicketMessage | null>(null);
  const [ticketMessageTarget, setTicketMessageTarget] = useState<TicketMessageTarget | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isRefreshingDisplayInfo, setIsRefreshingDisplayInfo] = useState(false);
  const [resendingMessageIds, setResendingMessageIds] = useState<Set<string>>(() => new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef(new Map<string, HTMLDivElement>());
  const activeWhatsappTicketId = ticket.externalIds?.whatsappTicketId;
  const roomChatId = ticket.externalIds?.whatsappRoomChatId;
  const historyReferences = useMemo(() => {
    const roomTicketReferences = allTickets
      .filter(
        (item) =>
          item.source === "whatsapp" &&
          item.viewKind === "ticket" &&
          item.externalIds?.whatsappRoomChatId === roomChatId,
      )
      .map(whatsappTicketToReference);
    const messageTicketReferences = ticket.messages.flatMap(
      (message) => message.ticketReferences ?? [],
    );

    return mergeTicketReferences(
      [...(ticket.ticketHistory ?? []), ...messageTicketReferences, ...roomTicketReferences],
      activeWhatsappTicketId,
    );
  }, [activeWhatsappTicketId, allTickets, roomChatId, ticket.messages, ticket.ticketHistory]);
  const selectedTicketReference =
    historyReferences.find((item) => item.id === activeWhatsappTicketId) ?? historyReferences[0];
  const focusedMessageExternalId =
    ticket.focusedMessageExternalId ?? selectedTicketReference?.messageExternalId;
  const isTicketView = ticket.viewKind === "ticket";

  const jumpToMessage = useCallback(
    (messageExternalId = focusedMessageExternalId) => {
      if (messageExternalId == null) return;

      const target = messageRefs.current.get(String(messageExternalId));
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
    },
    [focusedMessageExternalId],
  );

  // Load draft when ticket changes
  useEffect(() => {
    const saved = getDraft<WhatsappDraft>(draftKey);
    if (saved) {
      setInputText(saved.text || "");
      setAttachments(saved.attachments || []);
    } else {
      setInputText("");
      setAttachments([]);
    }
    setReplyingTo(null);
  }, [ticket.id, getDraft, draftKey]);

  useEffect(() => {
    if (!isTicketView || focusedMessageExternalId == null) return;

    const timeout = window.setTimeout(() => jumpToMessage(focusedMessageExternalId), 150);
    return () => window.clearTimeout(timeout);
  }, [focusedMessageExternalId, isTicketView, jumpToMessage, ticket.messages]);

  // Save draft when states change
  const saveDraft = (text: string, atts: AttachedFile[]) => {
    if (text.trim() || atts.length > 0) {
      setDraft(draftKey, { text, attachments: atts });
    } else {
      setDraft(draftKey, null);
    }
  };

  const handleInputChange = (val: string) => {
    setInputText(val);
    saveDraft(val, attachments);
  };

  // Auto scroll to bottom when message list changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [ticket.messages, replyingTo]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const selectedFiles = Array.from(files);

    setIsUploadingAttachment(true);
    try {
      const uploadedAttachments = await Promise.all(
        selectedFiles.map((file) => uploadCustomerServiceAttachment(file)),
      );
      const newAtts = [
        ...attachments,
        ...uploadedAttachments.map((attachment) => ({
          name: attachment.name,
          url: attachment.url,
          type: attachment.type,
        })),
      ];

      setAttachments(newAtts);
      saveDraft(inputText, newAtts);
    } catch (error) {
      toast.error("Gagal mengunggah lampiran WhatsApp", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsUploadingAttachment(false);

      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const newAtts = attachments.filter((_, i) => i !== index);
    setAttachments(newAtts);
    saveDraft(inputText, newAtts);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachments.length === 0) return;
    if (isUploadingAttachment) {
      toast.info("Tunggu lampiran selesai diunggah.");
      return;
    }
    if (attachments.some((attachment) => attachment.url.startsWith("data:"))) {
      toast.error("Lampiran WhatsApp belum siap dikirim", {
        description: "Unggah ulang lampiran agar backend menerima URL file yang valid.",
      });
      return;
    }

    addMessage(ticket.id, {
      authorId: "cs-agent",
      authorName: "CS Postmatic",
      content: inputText.trim(),
      direction: "out",
      attachments: attachments.map((att) => ({ name: att.name, url: att.url, type: att.type })),
      quotedMessage: replyingTo
        ? {
            authorName: replyingTo.authorName,
            content:
              replyingTo.content ||
              (replyingTo.attachments?.length ? "Lampiran file" : "Pesan media"),
          }
        : undefined,
      quotedExternalId: replyingTo?.externalId,
    });

    setInputText("");
    setAttachments([]);
    setReplyingTo(null);
    setDraft(draftKey, null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isUploadingAttachment && (inputText.trim() || attachments.length > 0)) {
        handleSend(e);
      }
    }
  };

  const isImage = (name: string, type?: string) => {
    if (type?.startsWith("image/")) return true;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  };

  const isVideo = (name: string, type?: string) => {
    if (type?.startsWith("video/")) return true;
    return /\.(mp4|webm|ogg)$/i.test(name);
  };

  const messagesWithDateSeparators = ticket.messages.map((message, index) => {
    const previousMessage = ticket.messages[index - 1];

    return {
      message,
      showDateSeparator:
        !previousMessage ||
        getMessageDateKey(previousMessage.createdAt) !== getMessageDateKey(message.createdAt),
    };
  });

  const handleHistoryTicketClick = (reference: TicketReference) => {
    if (reference.id === activeWhatsappTicketId) {
      jumpToMessage(reference.messageExternalId);
      return;
    }

    const ticketId = openWhatsappTicketReference(ticket.id, reference);
    if (onSelectTicket && ticketId) {
      onSelectTicket(ticketId);
      return;
    }

    jumpToMessage(reference.messageExternalId);
  };

  const handleRefreshDisplayInfo = useCallback(async () => {
    if (!roomChatId || isRefreshingDisplayInfo) return;

    setIsRefreshingDisplayInfo(true);
    try {
      await refreshWhatsappRoomDisplayInfo(ticket.id);
    } catch (error) {
      toast.error("Gagal refresh info WhatsApp", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsRefreshingDisplayInfo(false);
    }
  }, [isRefreshingDisplayInfo, refreshWhatsappRoomDisplayInfo, roomChatId, ticket.id]);

  const handleResendMessage = async (message: TicketMessage) => {
    if (resendingMessageIds.has(message.id)) return;

    const remoteMessageId = Number(message.externalId);
    if (!Number.isFinite(remoteMessageId)) {
      addMessage(ticket.id, {
        authorId: "cs-agent",
        authorName: "CS Postmatic",
        content: message.content,
        direction: "out",
        attachments: message.attachments,
        quotedExternalId: message.quotedExternalId,
        quotedMessage: message.quotedMessage,
      });
      toast.info("Pesan dikirim ulang sebagai pesan baru.");
      return;
    }

    setResendingMessageIds((currentIds) => new Set(currentIds).add(message.id));
    try {
      await resendWhatsappMessage(ticket.id, message.id);
    } catch {
      // Context already surfaces the resend error.
    } finally {
      setResendingMessageIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(message.id);
        return nextIds;
      });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={ticket.senderAvatar} alt={ticket.senderName} />
            <AvatarFallback>{ticket.senderName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{ticket.senderName}</p>
            <p className="text-xs text-muted-foreground">{ticket.senderHandle}</p>
            {isTicketView && (
              <p className="mt-0.5 max-w-md truncate text-xs font-medium text-foreground">
                {ticket.subject}
              </p>
            )}
          </div>
          {isTicketView && <StatusBadge status={ticket.status} />}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!roomChatId || isRefreshingDisplayInfo}
            onClick={handleRefreshDisplayInfo}
            title="Refresh nama dan foto profil WhatsApp"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshingDisplayInfo && "animate-spin")} />
          </Button>
          {isTicketView ? (
            <TicketStatusSelector ticketId={ticket.id} currentStatus={ticket.status} />
          ) : null}
        </div>
      </header>

      {historyReferences.length > 0 && (
        <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-6 py-2 text-xs">
          <History className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-semibold text-muted-foreground">History ticket</span>
          <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
            {historyReferences.map((reference) => (
              <button
                key={reference.id}
                type="button"
                onClick={() => handleHistoryTicketClick(reference)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded border px-2 py-1 text-[11px] font-semibold transition-colors",
                  reference.id === activeWhatsappTicketId
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                <span>
                  #{reference.id} {reference.subject}
                </span>
                <StatusBadge status={reference.status} />
              </button>
            ))}
          </div>
        </div>
      )}

      {isTicketView && (
        <div className="border-b border-border bg-card px-6 py-3">
          <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-muted/25 p-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="h-5 rounded px-1.5 text-[10px]">
                  Ticket #{ticket.externalIds?.whatsappTicketId}
                </Badge>
                <StatusBadge status={ticket.status} />
              </div>
              <p className="mt-1 truncate text-sm font-semibold text-foreground">
                {ticket.subject}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {selectedTicketReference?.body || ticket.snippet}
              </p>
            </div>
            {focusedMessageExternalId != null && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => jumpToMessage()}
                className="h-8 shrink-0 gap-1.5 text-xs"
              >
                <LocateFixed className="h-3.5 w-3.5" />
                Jump
              </Button>
            )}
          </div>
        </div>
      )}

      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="flex flex-col gap-3 px-6 py-6">
          {messagesWithDateSeparators.map(({ message: m, showDateSeparator }) => {
            if (m.authorId === "system") {
              return (
                <Fragment key={m.id}>
                  {showDateSeparator && (
                    <div className="flex w-full justify-center my-1">
                      <div className="rounded-full bg-card/90 border border-border/60 px-3 py-1 text-[11px] text-muted-foreground font-medium shadow-sm">
                        {formatMessageDateSeparator(m.createdAt)}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-center my-1 w-full">
                    <div className="rounded-full bg-muted/80 border border-border/50 px-3 py-1 text-[11px] text-muted-foreground font-medium shadow-sm">
                      {m.content} ({formatTime(m.createdAt)})
                    </div>
                  </div>
                </Fragment>
              );
            }
            const out = m.direction === "out";
            const deliveryLabel = out ? getDeliveryLabel(m) : "";
            const isFailedOutgoing =
              out &&
              (Boolean(m.errorMessage) ||
                ["failed", "error"].includes(m.sentStatus?.toLowerCase() ?? ""));
            const isResending = resendingMessageIds.has(m.id);
            return (
              <Fragment key={m.id}>
                {showDateSeparator && (
                  <div className="flex w-full justify-center my-1">
                    <div className="rounded-full bg-card/90 border border-border/60 px-3 py-1 text-[11px] text-muted-foreground font-medium shadow-sm">
                      {formatMessageDateSeparator(m.createdAt)}
                    </div>
                  </div>
                )}
                <div
                  ref={(node) => {
                    if (m.externalId == null) return;
                    const key = String(m.externalId);
                    if (node) {
                      messageRefs.current.set(key, node);
                    } else {
                      messageRefs.current.delete(key);
                    }
                  }}
                  className={cn(
                    "flex group items-center gap-2",
                    out ? "justify-end" : "justify-start",
                  )}
                >
                  {out && (
                    <button
                      type="button"
                      onClick={() => setReplyingTo(m)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                      title="Balas pesan ini"
                    >
                      <CornerUpLeft className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {!out && Number.isFinite(Number(m.externalId)) && (
                    <button
                      type="button"
                      onClick={() =>
                        setTicketMessageTarget({
                          message: m,
                          externalId: Number(m.externalId),
                        })
                      }
                      className="shrink-0 rounded-full p-1.5 text-muted-foreground opacity-60 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                      title="Tandai bubble ini sebagai ticket"
                    >
                      <BookmarkPlus className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-3.5 py-2 shadow-sm flex flex-col gap-1.5 relative",
                      out
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-card text-card-foreground border border-border",
                    )}
                  >
                    {/* Quoted Message display */}
                    {m.quotedMessage && (
                      <div
                        className={cn(
                          "border-l-4 p-1.5 rounded text-xs mb-0.5 max-w-sm overflow-hidden",
                          out
                            ? "bg-primary-foreground/10 border-primary-foreground/50 text-primary-foreground/90"
                            : "bg-muted border-primary/50 text-muted-foreground",
                        )}
                      >
                        <p className="font-bold text-[10px] mb-0.5">{m.quotedMessage.authorName}</p>
                        <p className="truncate text-[11px]">{m.quotedMessage.content}</p>
                      </div>
                    )}

                    {m.ticketReferences && m.ticketReferences.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {m.ticketReferences.map((reference) => (
                          <span
                            key={reference.id}
                            className={cn(
                              "rounded border px-1.5 py-0.5 text-[10px] font-bold",
                              out
                                ? "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
                                : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                            )}
                          >
                            Ticket #{reference.id}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Render Attachments inside bubble */}
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="flex flex-col gap-1.5 mb-1 max-w-sm">
                        {m.attachments.map((att, idx) => {
                          if (isImage(att.name)) {
                            return (
                              <img
                                key={idx}
                                src={att.url}
                                alt={att.name}
                                className="max-h-60 rounded object-cover cursor-pointer hover:opacity-90"
                              />
                            );
                          } else if (isVideo(att.name)) {
                            return (
                              <video
                                key={idx}
                                src={att.url}
                                controls
                                className="max-h-60 rounded"
                              />
                            );
                          } else {
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "flex items-center gap-2 rounded p-2 text-xs",
                                  out
                                    ? "bg-primary-foreground/10 text-primary-foreground"
                                    : "bg-muted text-foreground",
                                )}
                              >
                                <FileText className="h-4 w-4 shrink-0" />
                                <a
                                  href={att.url}
                                  download={att.name}
                                  className="underline hover:no-underline truncate font-medium max-w-[200px]"
                                  title={att.name}
                                >
                                  {att.name}
                                </a>
                              </div>
                            );
                          }
                        })}
                      </div>
                    )}

                    {m.content && (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                    )}
                    <div
                      className={cn(
                        "flex items-center gap-1 text-[9px] mt-0.5",
                        out ? "justify-end text-primary-foreground/75" : "text-muted-foreground",
                      )}
                    >
                      <span>{formatTime(m.createdAt)}</span>
                      {deliveryLabel && (
                        <>
                          <span aria-hidden="true">-</span>
                          <span>{deliveryLabel}</span>
                        </>
                      )}
                    </div>
                    {out && m.errorMessage && (
                      <p className="max-w-xs text-right text-[10px] leading-snug text-red-100/90">
                        {m.errorMessage}
                      </p>
                    )}
                    {isFailedOutgoing && (
                      <button
                        type="button"
                        onClick={() => handleResendMessage(m)}
                        disabled={isResending}
                        className={cn(
                          "ml-auto inline-flex h-6 items-center gap-1 rounded border px-2 text-[10px] font-semibold transition-colors",
                          out
                            ? "border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                            : "border-border bg-background text-foreground hover:bg-muted",
                          isResending && "opacity-70",
                        )}
                      >
                        <RefreshCw className={cn("h-3 w-3", isResending && "animate-spin")} />
                        Resend
                      </button>
                    )}
                  </div>

                  {!out && (
                    <button
                      type="button"
                      onClick={() => setReplyingTo(m)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                      title="Balas pesan ini"
                    >
                      <CornerUpLeft className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </Fragment>
            );
          })}
        </div>
      </ScrollArea>

      {/* WhatsApp Input Footer */}
      <footer className="border-t border-border bg-card p-3 shrink-0">
        <form onSubmit={handleSend} className="flex flex-col gap-2">
          {/* Quoting Preview Block */}
          {replyingTo && (
            <div className="flex items-center justify-between bg-muted/40 border border-border border-b-0 px-3 py-2 rounded-t-lg shrink-0">
              <div className="border-l-4 border-primary pl-2 overflow-hidden flex-1">
                <p className="text-xs font-bold text-foreground">{replyingTo.authorName}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[500px]">
                  {replyingTo.content ||
                    (replyingTo.attachments?.length ? "Lampiran file" : "Pesan media")}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 shrink-0"
                onClick={() => setReplyingTo(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-muted/20 p-2 max-h-24 overflow-y-auto">
              {attachments.map((att, index) => (
                <div
                  key={index}
                  className="relative flex items-center gap-1.5 rounded border border-border bg-background pl-2 pr-1.5 py-1 text-xs text-foreground shadow-sm max-w-[180px]"
                >
                  {isImage(att.name, att.type) ? (
                    <ImageIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  ) : isVideo(att.name, att.type) ? (
                    <VideoIcon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  )}
                  <span className="truncate font-medium flex-1 pr-3">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    className="absolute right-1 top-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Controls */}
          <div className={cn("flex items-center gap-2", replyingTo && "rounded-b-lg")}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isUploadingAttachment}
              className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploadingAttachment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
            <Textarea
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              rows={1}
              className="flex-1 min-h-[36px] h-9 max-h-24 py-2 resize-none text-sm placeholder:text-muted-foreground/70 bg-muted/30 focus-visible:ring-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isUploadingAttachment || (!inputText.trim() && attachments.length === 0)}
              className="h-9 w-9 rounded-full shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </footer>

      <TicketConfirmationDialog
        open={ticketMessageTarget !== null}
        defaultSubject={getTicketSubjectDefault(ticket, ticketMessageTarget)}
        onOpenChange={(open) => {
          if (!open) setTicketMessageTarget(null);
        }}
        onConfirm={(subject) => {
          if (ticketMessageTarget) {
            return markAsTicket(ticket.id, {
              subject,
              messageExternalId: ticketMessageTarget.externalId,
            });
          }
          throw new Error("Pilih bubble pesan WhatsApp yang ingin dijadikan ticket.");
        }}
      />
    </div>
  );
}
