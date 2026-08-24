import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/guard";
import { roleLandingPath } from "@/lib/staff/roleLanding";
import { StatusBadge } from "@/components/complaints/StatusBadge";
import { ComplaintTimeline } from "@/components/complaints/ComplaintTimeline";
import { StatusUpdateForm } from "@/components/complaints/StatusUpdateForm";

const COMPLAINT_TYPE_LABELS: Record<string, string> = {
  PROPOSAL: "Пропозиція / зауваження",
  PETITION: "Заява / клопотання",
  COMPLAINT: "Скарга",
};

interface ComplaintDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({
  params,
}: ComplaintDetailPageProps) {
  const session = await getStaffSession();
  if (!session) redirect("/staff/login");
  if (session.role === "INSPECTOR") redirect(roleLandingPath(session.role));

  const { id } = await params;

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { versionNumber: "asc" },
        include: { authorStaff: { select: { fullName: true } } },
      },
      attachments: true,
      street: true,
      collectionPoint: true,
    },
  });

  if (!complaint) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-gray-500">
            {complaint.registrationNumber}
          </span>
          <StatusBadge status={complaint.status} />
          <span className="text-xs text-gray-400">
            {COMPLAINT_TYPE_LABELS[complaint.type] ?? complaint.type}
          </span>
        </div>
        <h1 className="mt-1 text-xl font-bold text-gray-800">
          {complaint.subject}
        </h1>
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
          {complaint.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-4 text-sm">
          <h2 className="mb-2 font-medium text-gray-700">Заявник</h2>
          <p>{complaint.applicantName}</p>
          {complaint.applicantPhone ? <p>{complaint.applicantPhone}</p> : null}
          {complaint.applicantEmail ? <p>{complaint.applicantEmail}</p> : null}
        </div>
        <div className="card p-4 text-sm">
          <h2 className="mb-2 font-medium text-gray-700">Локація</h2>
          {complaint.addressText ? <p>{complaint.addressText}</p> : null}
          {complaint.street ? <p>Вулиця: {complaint.street.name}</p> : null}
          {complaint.collectionPoint ? (
            <p>Майданчик: {complaint.collectionPoint.address}</p>
          ) : null}
          {complaint.lat && complaint.lng ? (
            <p className="text-gray-500">
              {complaint.lat.toFixed(5)}, {complaint.lng.toFixed(5)}
            </p>
          ) : null}
          {!complaint.addressText && !complaint.street && !complaint.lat ? (
            <p className="text-gray-400">Не вказано</p>
          ) : null}
        </div>
      </div>

      {complaint.attachments.length > 0 ? (
        <div>
          <h2 className="mb-2 text-sm font-medium text-gray-700">
            Фотододатки
          </h2>
          <div className="flex flex-wrap gap-3">
            {complaint.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={`/uploads/${attachment.storagePath}`}
                target="_blank"
                rel="noreferrer"
                className="block h-24 w-24 overflow-hidden rounded-lg border border-gray-200"
              >
                <Image
                  src={`/uploads/${attachment.storagePath}`}
                  alt={attachment.originalFileName}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="mb-2 text-sm font-medium text-gray-700">
          Історія розгляду
        </h2>
        <ComplaintTimeline versions={complaint.versions} />
      </div>

      <StatusUpdateForm complaintId={complaint.id} currentStatus={complaint.status} />
    </div>
  );
}
