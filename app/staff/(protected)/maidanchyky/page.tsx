import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/guard";
import { roleLandingPath } from "@/lib/staff/roleLanding";
import { CollectionPointToggle } from "@/components/staff/CollectionPointToggle";
import { CollectionPointCreateForm } from "@/components/staff/CollectionPointCreateForm";

export default async function MaidanchykyAdminPage() {
  const session = await getStaffSession();
  if (!session) redirect("/staff/login");
  if (session.role === "INSPECTOR") redirect(roleLandingPath(session.role));

  const points = await prisma.collectionPoint.findMany({
    orderBy: [{ status: "asc" }, { address: "asc" }],
    include: { _count: { select: { containers: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Контейнерні майданчики
        </h1>
        <Link
          href="/staff/maidanchyky/import"
          className="text-sm font-medium text-primary-700 hover:underline"
        >
          Масовий імпорт CSV →
        </Link>
      </div>

      <CollectionPointCreateForm />

      <div className="mt-4 card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Адреса</th>
              <th className="px-3 py-2">Оператор</th>
              <th className="px-3 py-2">Наповненість</th>
              <th className="px-3 py-2">ВГВ</th>
              <th className="px-3 py-2">Контейнери</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {points.map((point) => (
              <tr
                key={point.id}
                className={`hover:bg-gray-50 ${point.status === "INACTIVE" ? "opacity-50" : ""}`}
              >
                <td className="px-3 py-2">{point.address}</td>
                <td className="px-3 py-2 text-gray-500">
                  {point.operatorName}
                </td>
                <td className="px-3 py-2">
                  {point.fillLevelPercent ?? "—"}%
                </td>
                <td className="px-3 py-2">{point.isBulkWasteSite ? "так" : "—"}</td>
                <td className="px-3 py-2">{point._count.containers}</td>
                <td className="px-3 py-2">
                  {point.status === "ACTIVE" ? "Активний" : "Деактивовано"}
                  {point.deactivationReason ? (
                    <span className="block text-xs text-gray-400">
                      {point.deactivationReason}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2">
                  <CollectionPointToggle id={point.id} status={point.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
