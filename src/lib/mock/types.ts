export type UserStatus = "Active" | "Inactive";
export type TxStatus = "Success" | "Pending" | "Failed";
export type TxType = "Income" | "Expense";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: "User" | "Creator";
  business: string;
  businessLogo: string;
  businessCategory: string;
  status: UserStatus;
  joinDate: string;
  lastLogin: string;
  balance: number;
  businesses: string[];
  topups: { id: string; date: string; amount: number; method: string }[];
  aiUsage: { id: string; model: string; tokens: number; date: string }[];
  devices: { ip: string; device: string; lastSeen: string }[];
  activityLog: { id: string; action: string; at: string }[];
}

export interface AdminRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: "Super Admin" | "Finance" | "Customer Support" | "Content";
  status: UserStatus;
  joinDate: string;
  lastLogin: string;
  auditLog: { id: string; action: string; module: string; timestamp: string }[];
  devices: { ip: string; device: string; lastSeen: string }[];
}

export interface BusinessRow {
  id: string;
  name: string;
  logo: string;
  owner: string;
  category: string;
  plan: "Free" | "Starter" | "Pro" | "Enterprise";
  balance: number;
  lastLogin: string;
  activeUsers: number;
  platforms: ("instagram" | "facebook" | "linkedin")[];
  products: { id: string; name: string; price: number; image: string }[];
  members: { id: string; name: string; role: string; avatar: string }[];
  transactions: { id: string; datetime: string; description: string; amount: number; status: TxStatus }[];
  aiStats: { totalRequests: number; totalTokens: number };
}

export interface TransactionRow {
  id: string;
  datetime: string;
  description: string;
  type: TxType;
  amount: number;
  method: string;
  status: TxStatus;
  userName: string;
  userId: string;
  auditTrail: { at: string; from: string; to: string; by: string }[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: "image" | "document";
  url?: string;
}

export interface MessageRow {
  id: string;
  channel: "Email" | "Chat" | "Report";
  contact: string;
  contactEmail?: string;
  contactAvatar: string;
  subject: string;
  preview: string;
  unread: boolean;
  starred?: boolean;
  folder?: "inbox" | "sent" | "drafts" | "spam" | "trash";
  priority?: "Low" | "Medium" | "High";
  reportStatus?: "Open" | "In Progress" | "Resolved";
  at: string;
  thread: {
    id: string;
    from: "them" | "us";
    body: string;
    at: string;
    attachments?: MessageAttachment[];
  }[];
}

export interface CampaignRow {
  id: string;
  name: string;
  platform: "WhatsApp" | "Gmail";
  targetAudience: string;
  status: "Sent" | "Draft" | "Scheduled";
  date: string;
}

export interface AiModelRow {
  id: string;
  name: string;
  category: "Image" | "Caption";
  provider: string;
  version: string;
  description: string;
  active: boolean;
  systemPrompt: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  requests: number;
  errors: { id: string; at: string; message: string }[];
}

export interface LogRow {
  id: string;
  at: string;
  actor: string;
  actorAvatar: string;
  action: "Login" | "Update" | "Delete" | "Create" | "Approve";
  module: string;
  ip: string;
  status: "Success" | "Failed";
  userAgent: string;
  location: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
}