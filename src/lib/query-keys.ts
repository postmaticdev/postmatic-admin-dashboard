export const ADMIN_NOTIFICATIONS_QUERY_PREFIX = ["notifications", "admin"] as const;
export const ADMIN_NOTIFICATIONS_QUERY_KEY = [...ADMIN_NOTIFICATIONS_QUERY_PREFIX, "list"] as const;
export const ADMIN_NOTIFICATION_UNREAD_QUERY_KEY = [
  ...ADMIN_NOTIFICATIONS_QUERY_PREFIX,
  "unread-count",
] as const;
