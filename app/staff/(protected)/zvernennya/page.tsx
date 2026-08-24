import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/guard";
import { roleLandingPath } from "@/lib/staff/roleLanding";
import { StatusBadge } from "@/components/complaints/StatusBadge";
import { getDeadlineUrgency } from "@/lib/complaints/deadlineStatus";
import { ChevronDownIcon } from "@/components/icons";
import type { ComplaintStatus } from "@/app/generated/prisma/client";

const STATUS_OPTIONS: { value: ComplaintStatus | ""; label: string }[] = [
  { value: "", label: "Усі статуси" },
  { value: "REGISTERED", label: "Зареєстровано" },
  { value: "UNDER_REVIEW", label: "На розгляді" },
  { value: "FORWARDED", label: "Направлено виконавцю" },
  { value: "DONE", label: "Виконано" },
  { value: "REJECTED", label: "Відмовлено" },
  { value: "EXTENDED", label: "Продовжено строк" },
  { value: "ANNULLED", label: "Анульовано" },
];

interface ZvernennyaRegistryPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

const REGISTRY_ROW_LIMIT = 100;

export default async function ZvernennyaRegistryPage({
  searchParams,
}: ZvernennyaRegistryPageProps) {
  const session = await getStaffSession();
  if (!session) redirect("/staff/login");
  if (session.role === "INSPECTOR") redirect(roleLandingPath(session.role));

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "";

  const complaints = await prisma.complaint.findMany({
    where: {
      ...(status ? { status: status as ComplaintStatus } : {}),
      ...(q
        ? {
            OR: [
              { registrationNumber: { contains: q, mode: "insensitive" } },
              { subject: { contains: q, mode: "insensitive" } },
              { applicantName: { contains: q, mode: "insensitive" } },
              { addressText: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: REGISTRY_ROW_LIMIT,
    include: { assignedToStaff: { select: { fullName: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        Реєстр звернень
      </h1>

      <form method="get" className="card mb-4 flex flex-wrap items-center gap-2 p-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Номер, тема, заявник, адреса…"
          className="min-w-[200px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
        />
        <div className="relative">
          <select
            name="status"
            defaultValue={status}
            className="appearance-none rounded-full border border-gray-300 py-2 pr-9 pl-3.5 text-sm text-gray-700 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <button
          type="submit"
          className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Фільтрувати
        </button>
      </form>

      {complaints.length === 0 ? (
        <p className="text-sm text-gray-500">Звернень не знайдено.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Номер</th>
                <th className="px-3 py-2">Тема</th>
                <th className="px-3 py-2">Заявник</th>
                <th className="px-3 py-2">Статус</th>
                <th className="px-3 py-2">Строк</th>
                <th className="px-3 py-2">Виконавець</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complaints.map((complaint) => {
                const urgency = getDeadlineUrgency(
                  complaint.dueDate,
                  complaint.status,
                );
                const urgencyClass =
                  urgency === "overdue"
                    ? "font-medium text-red-600"
                    : urgency === "soon"
                      ? "font-medium text-amber-600"
                      : "text-gray-500";
                return (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs">
                      {complaint.registrationNumber}
                    </td>
                    <td className="px-3 py-2">{complaint.subject}</td>
                    <td className="px-3 py-2">{complaint.applicantName}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className={`px-3 py-2 ${urgencyClass}`}>
                      {complaint.dueDate.toLocaleDateString("uk-UA", {
                        timeZone: "Europe/Kyiv",
                      })}
                      {urgency === "overdue"
                        ? " (прострочено)"
                        : urgency === "soon"
                          ? " (спливає)"
                          : ""}
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {complaint.assignedToStaff?.fullName ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/staff/zvernennya/${complaint.id}`}
                        className="font-medium text-primary-700 hover:underline"
                      >
                        Переглянути
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
