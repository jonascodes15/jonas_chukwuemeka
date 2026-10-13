import { MessageCircleQuestion } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  BarList,
  EmptyState,
  FilterTabs,
  PageHeader,
  PageSkeleton,
  Panel,
  SetupNotice,
  timeAgo,
} from "@/components/admin/ui";
import { faq } from "@/content/faq";
import { listChats, topFaqs } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";

export const metadata: Metadata = { title: "Chat logs" };

const DAYS = 30;

export default function ChatsPage({ searchParams }: PageProps<"/admin/chats">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {searchParams.then(({ filter }) => (
        <Chats unanswered={filter === "unanswered"} />
      ))}
    </Suspense>
  );
}

async function Chats({ unanswered }: { unanswered: boolean }) {
  await requireAdmin();
  const db = getDb();
  const header = (
    <PageHeader
      title="Chat logs"
      description="Questions asked in the FAQ chat. Unanswered ones show what to add to the FAQ next."
    />
  );
  if (!db) {
    return (
      <>
        {header}
        <SetupNotice />
      </>
    );
  }
  const [rows, top] = await Promise.all([listChats(db, unanswered), topFaqs(db, DAYS)]);
  const questionFor = new Map(faq.map((f) => [f.id, f.question]));

  return (
    <>
      {header}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div>
          <FilterTabs
            active={unanswered ? "unanswered" : "all"}
            items={[
              { label: "All", value: "all", href: "/admin/chats" },
              { label: "Unanswered", value: "unanswered", href: "/admin/chats?filter=unanswered" },
            ]}
          />
          <ChatList rows={rows} unanswered={unanswered} />
        </div>
        <Panel title={`Most asked, ${DAYS} days`}>
          <BarList rows={top} empty="No answered questions yet." format={(id) => questionFor.get(id) ?? id} />
        </Panel>
      </div>
    </>
  );
}

function ChatList({
  rows,
  unanswered,
}: {
  rows: Awaited<ReturnType<typeof listChats>>;
  unanswered: boolean;
}) {
  return (
    <Panel bodyClassName="p-0">
      {rows.length === 0 ? (
        <EmptyState
          icon={MessageCircleQuestion}
          title={unanswered ? "No unanswered questions" : "No questions yet"}
          body="Questions people ask in the chat on your site are logged here, including ones the FAQ couldn't answer."
        />
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((c) => (
            <li key={c.id} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4">
              <span
                className={`w-24 shrink-0 font-mono text-[0.65rem] uppercase ${c.answered ? "text-muted" : "text-accent-ink"}`}
              >
                {c.answered ? `Answered` : "Unanswered"}
              </span>
              <span className="min-w-0 flex-1 text-sm text-fg">{c.question}</span>
              {c.email && (
                <a href={`mailto:${c.email}`} className="text-sm text-accent-ink hover:underline">
                  {c.email}
                </a>
              )}
              <span className="shrink-0 text-xs text-muted">{timeAgo(c.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
