import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRssFeeds, type RemoteRssFeed } from "@/lib/workspace-management-api";
import { RSSItem } from "./types";
import { RSSTableList } from "./RSSTableList";

const RSS_QUERY_KEY = ["workspace", "rss-feeds"] as const;

function faviconFromUrl(value?: string | null) {
  if (!value) return "";

  try {
    const url = new URL(value);
    return `${url.origin}/favicon.ico`;
  } catch {
    return "";
  }
}

function mapRemoteRss(item: RemoteRssFeed): RSSItem {
  const id = String(item.id);
  const sourceUrl = item.url?.trim() || "";
  const title = item.title?.trim() || item.publisher?.trim() || `RSS #${id}`;

  return {
    id,
    name: title,
    logoUrl: faviconFromUrl(sourceUrl),
    sourceUrl,
    updateInterval: "-",
    status: "Active",
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function RSSContainer() {
  const rssQuery = useQuery({
    queryKey: RSS_QUERY_KEY,
    queryFn: getRssFeeds,
    staleTime: 30_000,
  });

  const items = useMemo(() => (rssQuery.data ?? []).map(mapRemoteRss), [rssQuery.data]);

  return (
    <div className="space-y-6">
      <RSSTableList
        items={items}
        isLoading={rssQuery.isLoading}
        errorMessage={
          rssQuery.isError ? getErrorMessage(rssQuery.error, "Gagal memuat RSS feed.") : undefined
        }
        isReadOnly
        onRetry={() => rssQuery.refetch()}
      />
    </div>
  );
}
