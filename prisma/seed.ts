import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  type WasteCategory,
  type SchedulePeriodicity,
  type CollectionMethod,
  type KnowledgeSourceType,
} from "../app/generated/prisma/client";
import { normalizeUkrainianStreetName } from "../lib/geo/ukrainianNormalize";
import { hashPassword } from "../lib/auth/hash";
import { parseKnowledgeMarkdown } from "../lib/knowledge/chunkMarkdown";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_DATA_DIR = join(__dirname, "seed-data");

function readJson<T>(fileName: string): T {
  return JSON.parse(
    readFileSync(join(SEED_DATA_DIR, fileName), "utf-8"),
  ) as T;
}

// --------------------------------------------------------------------------- //
// Реальні дані КП «Послуга», Прилуцька міська рада.
// JSON генерується скриптом scripts/build-seed-data.py з відсканованих
// графіків вивезення (prisma/seed-data/source/). Перезапустити скрипт після
// оновлення вихідного xlsx.
// --------------------------------------------------------------------------- //

interface VehicleRow {
  plateNumber: string;
  vehicleType: string;
  capacityM3: number;
  fuelNormLPer100km: number | null;
}

interface ContainerRow {
  wasteCategory: WasteCategory;
  volumeLiters: number;
  quantity: number;
}

interface ScheduleRow {
  daysOfWeek: number[];
  timeFrom: string;
  periodicity: SchedulePeriodicity;
  vehiclePlate: string | null;
}

interface CollectionPointRow {
  address: string;
  lat: number;
  lng: number;
  operatorName: string;
  isBulkWasteSite: boolean;
  internalNotes: string | null;
  containers: ContainerRow[];
  /** Графік вивезення для цього майданчика (з розкладу його вулиці). */
  schedule: ScheduleRow | null;
}

interface StreetRow {
  name: string;
  collectionMethod: CollectionMethod;
  primaryPointAddress: string | null;
  schedule: ScheduleRow | null;
}

interface PackageScheduleRow {
  daysOfWeek: number[];
  timeFrom: string;
  periodicity: SchedulePeriodicity;
  streetNames: string[];
}

function periodicityForDays(dayCount: number): SchedulePeriodicity {
  if (dayCount >= 5) return "DAILY";
  if (dayCount === 2) return "TWICE_WEEKLY";
  if (dayCount === 1) return "WEEKLY";
  return "TWICE_WEEKLY";
}

// --------------------------------------------------------------------------- //

async function seedVehicles(): Promise<Map<string, string>> {
  const rows = readJson<VehicleRow[]>("vehicles.json");
  const byPlate = new Map<string, string>();
  for (const row of rows) {
    const vehicle = await prisma.vehicle.create({ data: row });
    byPlate.set(row.plateNumber, vehicle.id);
  }
  console.log(`Seeded ${rows.length} vehicles.`);
  return byPlate;
}

async function seedCollectionPoints(
  vehicleIdByPlate: Map<string, string>,
): Promise<Map<string, string>> {
  const rows = readJson<CollectionPointRow[]>("collection-points.json");
  const byAddress = new Map<string, string>();
  let containerCount = 0;
  let scheduleCount = 0;

  for (const row of rows) {
    const point = await prisma.collectionPoint.create({
      data: {
        address: row.address,
        lat: row.lat,
        lng: row.lng,
        operatorName: row.operatorName,
        isBulkWasteSite: row.isBulkWasteSite,
        internalNotes: row.internalNotes,
        // Реальних вимірів наповненості немає — заповнює інспектор.
        fillLevelPercent: null,
        lastMeasuredAt: null,
      },
    });
    byAddress.set(row.address, point.id);

    if (row.containers.length > 0) {
      await prisma.container.createMany({
        data: row.containers.map((c) => ({
          collectionPointId: point.id,
          wasteCategory: c.wasteCategory,
          volumeLiters: c.volumeLiters,
          quantity: c.quantity,
        })),
      });
      containerCount += row.containers.length;
    }

    // Кожен майданчик отримує графік вивезення з розкладу своєї вулиці.
    if (row.schedule) {
      const daysOfWeek = [...row.schedule.daysOfWeek].sort((a, b) => a - b);
      await prisma.scheduleContainer.create({
        data: {
          collectionPointId: point.id,
          daysOfWeek,
          timeFrom: row.schedule.timeFrom,
          periodicity: periodicityForDays(daysOfWeek.length),
          vehicleId: row.schedule.vehiclePlate
            ? (vehicleIdByPlate.get(row.schedule.vehiclePlate) ?? null)
            : null,
        },
      });
      scheduleCount += 1;
    }
  }

  console.log(
    `Seeded ${rows.length} collection points, ${containerCount} containers, ` +
      `${scheduleCount} container schedules.`,
  );
  return byAddress;
}

async function seedStreets(
  pointIdByAddress: Map<string, string>,
): Promise<void> {
  const rows = readJson<StreetRow[]>("streets.json");

  for (const row of rows) {
    const street = await prisma.street.create({
      data: {
        name: row.name,
        nameNormalized: normalizeUkrainianStreetName(row.name),
        district: null,
        collectionMethod: row.collectionMethod,
      },
    });

    if (row.collectionMethod !== "CONTAINER" || !row.primaryPointAddress) {
      continue;
    }
    const pointId = pointIdByAddress.get(row.primaryPointAddress);
    if (!pointId) {
      console.warn(
        `  ! street "${row.name}": collection point "${row.primaryPointAddress}" not found`,
      );
      continue;
    }
    await prisma.street.update({
      where: { id: street.id },
      data: { primaryCollectionPointId: pointId },
    });
  }

  const containerStreets = rows.filter(
    (r) => r.collectionMethod === "CONTAINER",
  ).length;
  console.log(
    `Seeded ${rows.length} streets ` +
      `(${containerStreets} container / ${rows.length - containerStreets} package).`,
  );
}

async function seedPackageSchedules(): Promise<void> {
  const rows = readJson<PackageScheduleRow[]>("package-schedules.json");
  // Match on the exact street name, not the normalized form: "вул. Шевченка"
  // and "пров. Шевченка" are different streets that normalize to the same key.
  const streetIdByName = new Map<string, string>();
  for (const s of await prisma.street.findMany({
    where: { collectionMethod: "PACKAGE" },
    select: { id: true, name: true },
  })) {
    streetIdByName.set(s.name, s.id);
  }

  let groupCount = 0;
  let linkCount = 0;
  for (const row of rows) {
    const streetIds = row.streetNames
      .map((n) => streetIdByName.get(n))
      .filter((id): id is string => Boolean(id));
    if (streetIds.length === 0) continue;

    const schedulePackage = await prisma.schedulePackage.create({
      data: {
        daysOfWeek: row.daysOfWeek,
        timeFrom: row.timeFrom,
        periodicity: row.periodicity,
      },
    });
    await prisma.schedulePackageStreet.createMany({
      data: streetIds.map((streetId) => ({
        schedulePackageId: schedulePackage.id,
        streetId,
      })),
      skipDuplicates: true,
    });
    groupCount += 1;
    linkCount += streetIds.length;
  }

  console.log(
    `Seeded ${groupCount} package schedule groups covering ${linkCount} streets.`,
  );
}

// --------------------------------------------------------------------------- //

interface SortingGuideSeedRow {
  name: string;
  category: WasteCategory;
  isRecyclable: boolean;
  description: string;
  howToSort: string;
}

async function seedSortingGuide(): Promise<void> {
  const items = readJson<SortingGuideSeedRow[]>("sorting-guide.json");

  await prisma.sortingGuideItem.createMany({
    data: items.map((item, index) => ({
      name: item.name,
      category: item.category,
      isRecyclable: item.isRecyclable,
      description: item.description,
      howToSort: item.howToSort,
      sortOrder: index,
    })),
  });

  console.log(`Seeded ${items.length} sorting guide items.`);
}

// .example — зарезервована IANA TLD для документації/плейсхолдерів, щоб не
// видавати ці адреси за реальний урядовий домен.
const STAFF_SEED_USERS = [
  {
    email: "admin@prylukymtg.example",
    fullName: "Адміністратор Системи",
    phone: "+380671230001",
    role: "ADMIN" as const,
  },
  {
    email: "dispatcher@prylukymtg.example",
    fullName: "Диспетчер Оператора",
    phone: "+380671230002",
    role: "DISPATCHER" as const,
  },
  {
    email: "inspector@prylukymtg.example",
    fullName: "Інспектор благоустрою",
    phone: "+380671230003",
    role: "INSPECTOR" as const,
  },
  {
    email: "o.melnyk@prylukymtg.example",
    fullName: "Мельник Олена Сергіївна",
    phone: "+380684560004",
    role: "DISPATCHER" as const,
  },
  {
    email: "r.bondarenko@prylukymtg.example",
    fullName: "Бондаренко Руслан Олегович",
    phone: "+380665670005",
    role: "INSPECTOR" as const,
  },
];

async function seedStaffUsers(): Promise<void> {
  const plainPassword = process.env.STAFF_SEED_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await hashPassword(plainPassword);

  for (const staff of STAFF_SEED_USERS) {
    await prisma.staffUser.upsert({
      where: { email: staff.email },
      create: { ...staff, passwordHash },
      update: {
        phone: staff.phone,
        fullName: staff.fullName,
        role: staff.role,
      },
    });
  }

  console.log(
    `Seeded ${STAFF_SEED_USERS.length} staff users (dev password: STAFF_SEED_PASSWORD env or "ChangeMe123!").`,
  );
}

const NEWS_SEED_POSTS = [
  {
    title: "Запущено вебплатформу «Чисті Прилуки»",
    body: "Тепер графіки вивезення, мапу контейнерних майданчиків і подання звернень можна переглянути онлайн, без відвідування виконкому.",
    daysAgo: 1,
  },
  {
    title: "Завантажено графіки вивезення ТПВ КП «Послуга»",
    body: "На платформі — реальні маршрути, дні й час вивезення по вулицях громади та перелік контейнерних майданчиків з координатами. Якщо помітили розбіжність із фактичним вивезенням, повідомте через розділ «Звернення».",
    daysAgo: 3,
  },
];

async function seedNews(): Promise<void> {
  await prisma.newsPost.deleteMany();
  await prisma.newsPost.createMany({
    data: NEWS_SEED_POSTS.map((post) => ({
      title: post.title,
      body: post.body,
      isPublished: true,
      publishedAt: new Date(Date.now() - post.daysAgo * 24 * 60 * 60 * 1000),
    })),
  });
  console.log(`Seeded ${NEWS_SEED_POSTS.length} news posts.`);
}

async function seedKnowledgeBase(): Promise<void> {
  const knowledgeDocsDir = join(SEED_DATA_DIR, "knowledge-docs");
  const fileNames = readdirSync(knowledgeDocsDir).filter((f) =>
    f.endsWith(".md"),
  );

  let totalChunks = 0;
  for (const fileName of fileNames) {
    const raw = readFileSync(join(knowledgeDocsDir, fileName), "utf-8");
    const parsed = parseKnowledgeMarkdown(raw);

    const document = await prisma.knowledgeDocument.create({
      data: {
        title: parsed.title,
        sourceType: parsed.sourceType as KnowledgeSourceType,
        sourceUrl: parsed.sourceUrl,
        fullText: parsed.fullText,
        isActive: true,
      },
    });

    await prisma.knowledgeChunk.createMany({
      data: parsed.chunks.map((chunk, index) => ({
        documentId: document.id,
        chunkIndex: index,
        content: chunk.content,
        citationLabel: chunk.citationLabel,
      })),
    });

    totalChunks += parsed.chunks.length;
  }

  console.log(
    `Seeded ${fileNames.length} knowledge documents with ${totalChunks} chunks.`,
  );
}

async function main(): Promise<void> {
  console.log("Clearing existing data...");
  await prisma.complaintAttachment.deleteMany();
  await prisma.complaintVersion.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.scheduleContainer.deleteMany();
  await prisma.schedulePackageStreet.deleteMany();
  await prisma.schedulePackage.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.container.deleteMany();
  await prisma.collectionPointPhoto.deleteMany();
  await prisma.street.updateMany({ data: { primaryCollectionPointId: null } });
  await prisma.collectionPoint.deleteMany();
  await prisma.street.deleteMany();
  await prisma.sortingGuideItem.deleteMany();
  await prisma.knowledgeChunk.deleteMany();
  await prisma.knowledgeDocument.deleteMany();

  const vehicleIdByPlate = await seedVehicles();
  const pointIdByAddress = await seedCollectionPoints(vehicleIdByPlate);
  await seedStreets(pointIdByAddress);
  await seedPackageSchedules();
  await seedSortingGuide();
  await seedStaffUsers();
  await seedNews();
  await seedKnowledgeBase();
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
