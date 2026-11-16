/**
 * EventStreamPanel - Audit event stream: filter input, two-column event list
 * (event name / date and time), right metadata panel with actor info and
 * "View event" button, event details JSON block with line numbers and
 * Previous/Next pager
 * (WorkOS Events pattern).
 */
import React from "react";

export interface StreamEvent {
  id: string;
  name: string;
  date: string;
  metadata: { label: string; value: string }[];
  details: string;
}

export interface EventStreamPanelProps {
  filterPlaceholder?: string;
  eventColumnLabel?: string;
  dateColumnLabel?: string;
  events?: StreamEvent[];
  metadataTitle?: string;
  detailsTitle?: string;
  detailsLines?: number;
  className?: string;
  onFilterChange?: (value: string) => void;
  onEventSelect?: (event: StreamEvent) => void;
  onViewEvent?: (event: StreamEvent) => void;
}

export default function EventStreamPanel({
  filterPlaceholder = "Filter by event name, data, or date range",
  eventColumnLabel = "Event",
  dateColumnLabel = "Date and time",
  events = [
    {
      id: "ev1",
      name: "user.updated",
      date: "Nov 14, 2026 3:12 PM",
      metadata: [
        { label: "User", value: "Sama Lee" },
        { label: "Email", value: "sama@example.com" },
        { label: "Environment", value: "Production" },
      ],
      details:
        '{\n  "event": "user.updated",\n  "user": {\n    "id": "user_01H9",\n    "email": "sama@example.com",\n    "first_name": "Sama",\n    "last_name": "Lee",\n    "email_verified": true\n  }\n}',
    },
    {
      id: "ev2",
      name: "organization_membership.updated",
      date: "Nov 14, 2026 2:48 PM",
      metadata: [
        { label: "Organization", value: "Acme Inc" },
        { label: "Role", value: "admin" },
      ],
      details: '{\n  "event": "organization_membership.updated",\n  "role": "admin"\n}',
    },
    {
      id: "ev3",
      name: "invitation.created",
      date: "Nov 14, 2026 11:05 AM",
      metadata: [{ label: "Email", value: "new hire" }],
      details: '{\n  "event": "invitation.created"\n}',
    },
    {
      id: "ev4",
      name: "connection.activated",
      date: "Nov 13, 2026 5:30 PM",
      metadata: [{ label: "Connection", value: "Okta SSO" }],
      details: '{\n  "event": "connection.activated"\n}',
    },
    {
      id: "ev5",
      name: "session.created",
      date: "Nov 13, 2026 9:02 AM",
      metadata: [{ label: "User", value: "Sama Lee" }],
      details: '{\n  "event": "session.created"\n}',
    },
  ],
  metadataTitle = "Metadata",
  detailsTitle = "Event Details",
  detailsLines = 10,
  className = "",
  onFilterChange,
  onEventSelect,
  onViewEvent,
}: EventStreamPanelProps) {
  const [filter, setFilter] = React.useState("");
  const [activeId, setActiveId] = React.useState(events[0]?.id ?? "");

  const filtered = filter
    ? events.filter((ev) => ev.name.toLowerCase().includes(filter.toLowerCase()))
    : events;
  const active = events.find((ev) => ev.id === activeId) ?? events[0];
  const detailLineCount = Math.max(
    detailsLines,
    active ? active.details.split("\n").length : 1
  );

  const select = (ev: StreamEvent) => {
    setActiveId(ev.id);
    onEventSelect?.(ev);
  };

  return (
    <div data-stream-panel className={`grid w-full gap-4 lg:grid-cols-5 ${className}`}>
      {/* left: list */}
      <div data-stream-list className="lg:col-span-3 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 p-3 dark:border-zinc-800">
          <input
            data-stream-filter
            type="text"
            value={filter}
            placeholder={filterPlaceholder}
            onChange={(e) => {
              setFilter(e.target.value);
              onFilterChange?.(e.target.value);
            }}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
        </div>
        <div data-stream-columns className="grid grid-cols-2 border-b border-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <span>{eventColumnLabel}</span>
          <span>{dateColumnLabel}</span>
        </div>
        <ul data-stream-items>
          {filtered.map((ev) => (
            <li key={ev.id}>
              <button
                data-stream-event={ev.id}
                type="button"
                onClick={() => select(ev)}
                className={`grid w-full grid-cols-2 items-center px-4 py-3 text-left text-sm transition-colors ${
                  ev.id === active?.id
                    ? "bg-zinc-50 dark:bg-zinc-800/60"
                    : "hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
                }`}
              >
                <span className="truncate font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-100">{ev.name}</span>
                <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">{ev.date}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">No events match this filter</li>
          )}
        </ul>
      </div>

      {/* right: details */}
      <div data-stream-details className="lg:col-span-2 space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p data-stream-metadata-title className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{metadataTitle}</p>
          <dl data-stream-metadata className="mt-3 space-y-2">
            {(active?.metadata ?? []).map((m) => (
              <div key={m.label} className="flex items-baseline justify-between gap-3">
                <dt className="text-xs text-zinc-500 dark:text-zinc-400">{m.label}</dt>
                <dd className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">{m.value}</dd>
              </div>
            ))}
          </dl>
          <button
            data-stream-view-event
            type="button"
            onClick={() => active && onViewEvent?.(active)}
            className="mt-4 w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            View event
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p data-stream-details-title className="border-b border-zinc-100 px-4 py-2.5 text-sm font-bold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">{detailsTitle}</p>
          <div data-stream-json className="flex gap-3 overflow-x-auto px-4 py-3 font-mono text-[11px] leading-5">
            <span data-stream-json-lines aria-hidden="true" className="select-none text-right text-zinc-300 dark:text-zinc-600">
              {Array.from({ length: detailLineCount }, (_, i) => i + 1).join("\n")}
            </span>
            <pre className="whitespace-pre text-sky-700 dark:text-sky-300">{active?.details}</pre>
          </div>
          <div data-stream-pager className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
            <button type="button" className="text-xs font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">← Previous</button>
            <button type="button" className="text-xs font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
