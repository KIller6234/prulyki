import Link from "next/link";
import type { DispatcherComplaintItem } from "@/lib/staff/dispatcherComplaints";
import {
  COMPLAINT_PRIORITY_LABELS,
  COMPLAINT_PRIORITY_BADGE_CLASSES,
} from "@/lib/complaints/priorityBadge";
import { ChatBubbleIcon, ArrowRightIcon } from "@/components/icons";

function formatCardTime(iso: string): string {
  return new Date(iso).toLocaleString("uk-UA", {
    timeZone: "Europe/Kyiv",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

interface ComplaintCardProps {
  complaint: DispatcherComplaintItem;
  onDragStart: (event: React.DragEvent<HTMLElement>) => void;
  onAssignClick: () => void;
  onAdvanceClick: (() => void) | null;
}

export function ComplaintCard({
  complaint,
  onDragStart,
  onAssignClick,
  onAdvanceClick,
}: ComplaintCardProps) {
  return (
    <article
      draggable
      onDragStart={onDragStart}
      className="card cursor-grab space-y-2 p-3 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/staff/zvernennya/${complaint.id}`}
          className="text-sm font-semibold text-gray-800 hover:text-primary-700 hover:underline"
        >
          {complaint.subject}
        </Link>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${COMPLAINT_PRIORITY_BADGE_CLASSES[complaint.priority] ?? "bg-gray-100 text-gray-600"}`}
        >
          {COMPLAINT_PRIORITY_LABELS[complaint.priority] ?? complaint.priority}
        </span>
      </div>

      {complaint.addressText ? (
        <p className="truncate text-xs text-gray-500">{complaint.addressText}</p>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {complaint.assignedTo ? (
            <>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white">
                {getInitials(complaint.assignedTo.fullName)}
              </span>
              <span className="truncate text-xs text-gray-600">
                {complaint.assignedTo.fullName}
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={onAssignClick}
              className="text-xs font-medium text-primary-700 hover:underline"
            >
              Призначити виконавця
            </button>
          )}
        </div>

        {onAdvanceClick ? (
          <button
            type="button"
            onClick={onAdvanceClick}
            aria-label="Перемістити в наступну колонку"
            title="Перемістити в наступну колонку"
            className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-primary-700"
          >
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>{formatCardTime(complaint.createdAt)}</span>
        {complaint.commentsCount > 0 ? (
          <span className="flex items-center gap-1">
            <ChatBubbleIcon className="h-3 w-3" />
            {complaint.commentsCount}
          </span>
        ) : null}
      </div>
    </article>
  );
}
