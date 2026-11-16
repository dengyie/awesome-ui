/**
 * HelpCenterHome - Help center landing: hero title, big search bar with
 * submit button, "browse by topic" rows with chevrons and optional expanded
 * article links (GetYourGuide help center pattern).
 */
import React from "react";

export interface HelpTopic {
  id: string;
  label: string;
  articles?: string[];
}

export interface HelpCenterHomeProps {
  title?: string;
  searchPlaceholder?: string;
  topics?: HelpTopic[];
  className?: string;
  onSearchSubmit?: (query: string) => void;
  onTopicClick?: (topic: HelpTopic) => void;
  onArticleClick?: (topic: HelpTopic, article: string) => void;
}

export default function HelpCenterHome({
  title = "Welcome to the Help Center",
  searchPlaceholder = "Cancellation, meeting point, etc.",
  topics = [
    { id: "plan", label: "Plan, search and book" },
    { id: "activity", label: "Activity information" },
    { id: "voucher", label: "Booking confirmation, voucher and tickets" },
    { id: "pickup", label: "Meeting point and pickup" },
    { id: "day", label: "On the day of the activity" },
    { id: "management", label: "Booking management", articles: ["Change the date or time", "Cancel your booking", "Refund policy"] },
    { id: "cancellation", label: "Cancellation" },
    { id: "payment", label: "Payment and refunds" },
  ],
  className = "",
  onSearchSubmit,
  onTopicClick,
  onArticleClick,
}: HelpCenterHomeProps) {
  const [query, setQuery] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>("management");

  return (
    <div data-helpct className={`w-full rounded-2xl border border-zinc-200 bg-white px-5 py-8 dark:border-zinc-800 dark:bg-zinc-900 sm:px-8 ${className}`}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 data-helpct-title className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{title}</h2>
        <p data-helpct-label className="mt-6 text-left text-sm font-bold text-zinc-800 dark:text-zinc-100">Search for a topic</p>
        <form
          data-helpct-form
          className="mt-2 flex overflow-hidden rounded-lg border border-zinc-300 focus-within:border-indigo-500 dark:border-zinc-700"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit?.(query);
          }}
        >
          <input
            type="search"
            data-helpct-input
            value={query}
            placeholder={searchPlaceholder}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 px-4 py-2.5 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 dark:bg-zinc-900 dark:text-zinc-200"
          />
          <button type="submit" data-helpct-submit className="bg-indigo-600 px-5 text-white transition-colors hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400" aria-label="Search">
            🔍
          </button>
        </form>

        <p data-helpct-browse className="mt-8 text-left text-sm font-bold text-zinc-800 dark:text-zinc-100">Or browse by topic</p>
        <div data-helpct-topics className="mt-2 text-left">
          {topics.map((topic) => {
            const open = openId === topic.id;
            const expandable = Array.isArray(topic.articles) && topic.articles.length > 0;
            return (
              <div key={topic.id} data-helpct-topic={topic.id} className="border-b border-zinc-200 last:border-0 dark:border-zinc-800">
                <button
                  type="button"
                  data-helpct-topic-btn={topic.id}
                  onClick={() => {
                    if (expandable) {
                      setOpenId(open ? null : topic.id);
                    }
                    onTopicClick?.(topic);
                  }}
                  className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-zinc-700 transition-colors hover:text-indigo-600 dark:text-zinc-200 dark:hover:text-indigo-300"
                >
                  <span>{topic.label}</span>
                  <span aria-hidden="true" className="text-xs text-zinc-400">{expandable ? (open ? "▾" : "›") : "›"}</span>
                </button>
                {expandable && open ? (
                  <div data-helpct-articles={topic.id} className="pb-4">
                    {topic.articles!.map((a) => (
                      <button
                        key={a}
                        type="button"
                        data-helpct-article={a}
                        onClick={() => onArticleClick?.(topic, a)}
                        className="block py-1.5 text-left text-sm text-indigo-600 transition-colors hover:underline dark:text-indigo-300"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
