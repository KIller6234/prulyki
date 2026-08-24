import { StatusBadge } from "./StatusBadge";

export interface TimelineVersion {
  versionNumber: number;
  status: string;
  resolutionText: string | null;
  authorStaff: { fullName: string } | null;
  changedAt: Date;
}

export function ComplaintTimeline({ versions }: { versions: TimelineVersion[] }) {
  return (
    <ol className="space-y-3 border-l border-gray-200 pl-4">
      {versions.map((version) => (
        <li key={version.versionNumber}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400">
              v{version.versionNumber}
            </span>
            <StatusBadge status={version.status} />
            <span className="text-xs text-gray-400">
              {version.changedAt.toLocaleString("uk-UA", {
                timeZone: "Europe/Kyiv",
              })}
            </span>
            {version.authorStaff ? (
              <span className="text-xs text-gray-400">
                · {version.authorStaff.fullName}
              </span>
            ) : null}
          </div>
          {version.resolutionText ? (
            <p className="mt-1 text-sm text-gray-700">
              {version.resolutionText}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
