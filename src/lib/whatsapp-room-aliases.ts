import type { TicketMessage } from "@/lib/types/ticket";

const STORAGE_KEY = "postmatic.whatsapp.room-aliases";
const MAX_ALIASES = 200;

export interface WhatsappRoomAlias {
  roomChatId?: number;
  phone: string;
  senderName: string;
  senderHandle: string;
  senderAvatar?: string;
  subject?: string;
  snippet?: string;
  updatedAt?: string;
  lastMessage?: TicketMessage;
}

export function normalizeWhatsappDigits(value?: string | null) {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (!digits) return "";

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("620")) {
    return `62${digits.slice(3)}`;
  }

  if (digits.startsWith("8")) {
    return `62${digits}`;
  }

  return digits;
}

export function whatsappPhonesMatch(left?: string | null, right?: string | null) {
  const leftDigits = normalizeWhatsappDigits(left);
  const rightDigits = normalizeWhatsappDigits(right);
  if (!leftDigits || !rightDigits) return false;
  if (leftDigits === rightDigits) return true;

  const lengthDelta = Math.abs(leftDigits.length - rightDigits.length);
  if (lengthDelta > 3) return false;

  return leftDigits.startsWith(rightDigits) || rightDigits.startsWith(leftDigits);
}

export function readWhatsappRoomAliases() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (alias): alias is WhatsappRoomAlias =>
        alias &&
        typeof alias === "object" &&
        typeof alias.phone === "string" &&
        typeof alias.senderName === "string" &&
        typeof alias.senderHandle === "string",
    );
  } catch {
    return [];
  }
}

export function rememberWhatsappRoomAlias(alias: WhatsappRoomAlias) {
  if (typeof window === "undefined") return;

  const normalizedPhone = normalizeWhatsappDigits(alias.phone);
  if (!normalizedPhone) return;

  const nextAlias = {
    ...alias,
    phone: normalizedPhone,
  };
  const existingAliases = readWhatsappRoomAliases();
  const withoutDuplicate = existingAliases.filter((item) => {
    if (nextAlias.roomChatId != null && item.roomChatId === nextAlias.roomChatId) return false;

    return !whatsappPhonesMatch(item.phone, normalizedPhone);
  });

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([nextAlias, ...withoutDuplicate].slice(0, MAX_ALIASES)),
  );
}

export function findWhatsappRoomAlias({
  roomChatId,
  phones,
}: {
  roomChatId?: number;
  phones?: Array<string | null | undefined>;
}) {
  const aliases = readWhatsappRoomAliases();
  if (!aliases.length) return undefined;

  if (roomChatId != null) {
    const aliasByRoom = aliases.find((alias) => alias.roomChatId === roomChatId);
    if (aliasByRoom) return aliasByRoom;
  }

  return aliases.find((alias) =>
    (phones ?? []).some((phone) => whatsappPhonesMatch(alias.phone, phone)),
  );
}
