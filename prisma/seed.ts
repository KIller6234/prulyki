import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  WasteCategory,
  type KnowledgeSourceType,
  type ComplaintStatus,
  type ComplaintPriority,
  type ComplaintType,
} from "../app/generated/prisma/client";
import { normalizeUkrainianStreetName } from "../lib/geo/ukrainianNormalize";
import { hashPassword } from "../lib/auth/hash";
import { parseKnowledgeMarkdown } from "../lib/knowledge/chunkMarkdown";
import { generateRegistrationNumber } from "../lib/complaints/registrationNumber";
import { computeComplaintDeadline } from "../lib/complaints/deadline";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_DATA_DIR = join(__dirname, "seed-data");

/** Deterministic PRNG (mulberry32) so repeated seed runs produce the same data. */
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createSeededRandom(20260816);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

interface StreetSeedRow {
  name: string;
  district: string;
  collectionMethod: "CONTAINER" | "PACKAGE";
}

interface SortingGuideSeedRow {
  name: string;
  category: keyof typeof WasteCategory;
  isRecyclable: boolean;
  description: string;
  howToSort: string;
}

// Approximate center of Pryluky, Chernihiv Oblast (WGS84). Placeholder coordinates —
// not a real geodetic survey. See plan doc for the seed-data disclosure.
const CITY_CENTER = { lat: 50.583, lng: 32.383 };
const COORD_SPREAD_DEGREES = 0.018;

const OPERATOR_NAMES = [
  "КП «Прилукиблагоустрій»",
  "КП «Прилукиспецкомунтранс»",
];

async function seedStreetsAndCollectionPoints(): Promise<void> {
  const streets: StreetSeedRow[] = JSON.parse(
    readFileSync(join(SEED_DATA_DIR, "streets.json"), "utf-8"),
  );

  let bulkWasteSitesCreated = 0;
  const BULK_WASTE_SITE_TARGET = 4;

  for (const [index, streetRow] of streets.entries()) {
    const street = await prisma.street.create({
      data: {
        name: streetRow.name,
        nameNormalized: normalizeUkrainianStreetName(streetRow.name),
        district: streetRow.district,
        collectionMethod: streetRow.collectionMethod,
      },
    });

    if (streetRow.collectionMethod !== "CONTAINER") {
      continue;
    }

    const latOffset = (random() - 0.5) * 2 * COORD_SPREAD_DEGREES;
    const lngOffset = (random() - 0.5) * 2 * COORD_SPREAD_DEGREES;
    const shouldBeBulkWasteSite =
      bulkWasteSitesCreated < BULK_WASTE_SITE_TARGET && index % 9 === 0;

    const fillLevelPercent = Math.floor(random() * 101);

    const point = await prisma.collectionPoint.create({
      data: {
        address: `${streetRow.name}, майданчик біля буд. ${1 + Math.floor(random() * 40)}`,
        lat: CITY_CENTER.lat + latOffset,
        lng: CITY_CENTER.lng + lngOffset,
        operatorName: pick(OPERATOR_NAMES),
        isBulkWasteSite: shouldBeBulkWasteSite,
        fillLevelPercent,
        lastMeasuredAt: new Date(
          Date.now() - Math.floor(random() * 5) * 24 * 60 * 60 * 1000,
        ),
      },
    });

    if (shouldBeBulkWasteSite) {
      bulkWasteSitesCreated += 1;
    }

    await prisma.street.update({
      where: { id: street.id },
      data: { primaryCollectionPointId: point.id },
    });

    const containerPlan: { wasteCategory: WasteCategory; volumeLiters: number }[] =
      [{ wasteCategory: "MIXED", volumeLiters: 1100 }];

    if (random() > 0.3) {
      containerPlan.push({ wasteCategory: "PLASTIC", volumeLiters: 1100 });
    }
    if (random() > 0.6) {
      containerPlan.push({ wasteCategory: "GLASS", volumeLiters: 240 });
    }
    if (random() > 0.75) {
      containerPlan.push({ wasteCategory: "PAPER", volumeLiters: 240 });
    }

    await prisma.container.createMany({
      data: containerPlan.map((c) => ({
        collectionPointId: point.id,
        wasteCategory: c.wasteCategory,
        volumeLiters: c.volumeLiters,
        quantity: 1,
      })),
    });
  }

  const streetCount = await prisma.street.count();
  const pointCount = await prisma.collectionPoint.count();
  console.log(
    `Seeded ${streetCount} streets and ${pointCount} collection points.`,
  );
}

const VEHICLES = [
  {
    plateNumber: "AA 1234 EI",
    vehicleType: "Сміттєвоз",
    capacityM3: 12,
    fuelNormLPer100km: 33,
  },
  {
    plateNumber: "AA 5678 EI",
    vehicleType: "Сміттєвоз",
    capacityM3: 8,
    fuelNormLPer100km: 28,
  },
];

// [daysOfWeek, periodicity] — 1=Пн ... 7=Нд.
const CONTAINER_DAY_PATTERNS: [number[], "WEEKLY" | "TWICE_WEEKLY"][] = [
  [[1, 4], "TWICE_WEEKLY"],
  [[2, 5], "TWICE_WEEKLY"],
  [[3], "WEEKLY"],
];

const CONTAINER_TIMES = ["07:00", "07:30", "08:00"];

async function seedContainerSchedules(): Promise<void> {
  const vehicles = [];
  for (const vehicleData of VEHICLES) {
    vehicles.push(await prisma.vehicle.create({ data: vehicleData }));
  }

  const points = await prisma.collectionPoint.findMany({
    select: { id: true },
  });

  for (const point of points) {
    const [daysOfWeek, periodicity] = pick(CONTAINER_DAY_PATTERNS);
    await prisma.scheduleContainer.create({
      data: {
        collectionPointId: point.id,
        daysOfWeek,
        timeFrom: pick(CONTAINER_TIMES),
        periodicity,
        vehicleId: pick(vehicles).id,
      },
    });
  }

  console.log(`Seeded ${vehicles.length} vehicles and ${points.length} container schedules.`);
}

const PACKAGE_GROUP_SIZE = 2;
const PACKAGE_TIMES = ["06:00", "06:30", "19:00"];

async function seedPackageSchedules(): Promise<void> {
  const packageStreets = await prisma.street.findMany({
    where: { collectionMethod: "PACKAGE" },
    select: { id: true },
    orderBy: { name: "asc" },
  });

  let groupCount = 0;
  for (let i = 0; i < packageStreets.length; i += PACKAGE_GROUP_SIZE) {
    const group = packageStreets.slice(i, i + PACKAGE_GROUP_SIZE);
    const [daysOfWeek, periodicity] = pick(CONTAINER_DAY_PATTERNS);

    const schedulePackage = await prisma.schedulePackage.create({
      data: {
        daysOfWeek,
        timeFrom: pick(PACKAGE_TIMES),
        periodicity,
      },
    });

    await prisma.schedulePackageStreet.createMany({
      data: group.map((street) => ({
        schedulePackageId: schedulePackage.id,
        streetId: street.id,
      })),
    });

    groupCount += 1;
  }

  console.log(`Seeded ${groupCount} package schedule groups for ${packageStreets.length} streets.`);
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

async function seedSortingGuide(): Promise<void> {
  const items: SortingGuideSeedRow[] = JSON.parse(
    readFileSync(join(SEED_DATA_DIR, "sorting-guide.json"), "utf-8"),
  );

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

const NEWS_SEED_POSTS = [
  {
    title: "Запущено вебплатформу «Чисті Прилуки»",
    body: "Тепер графіки вивезення, мапу контейнерних майданчиків і подання звернень можна переглянути онлайн, без відвідування виконкому.",
    daysAgo: 1,
  },
  {
    title: "Триває дослідне наповнення бази даних контейнерних майданчиків",
    body: "Координати та стан наповненості контейнерів наразі уточнюються — якщо помітили розбіжність, повідомте через розділ «Звернення».",
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

// ---------- Звернення громадян (для диспетчерської канбан-дошки) ----------

const COMPLAINT_SEED_COUNT = 55;
const COMPLAINT_DAY_MS = 24 * 60 * 60 * 1000;
const COMPLAINT_SPREAD_DAYS = 21;

const COMPLAINT_SUBJECTS = [
  "Переповнений контейнер",
  "Сміття біля майданчика",
  "Неприємний запах",
  "Контейнер пошкоджено",
  "Не вивозять сміття за графіком",
  "Захаращення прибудинкової території",
  "Стихійне сміттєзвалище",
  "Розкидане сміття після вивезення",
];

const COMPLAINT_APPLICANTS = [
  "Іваненко Оксана Петрівна",
  "Ткаченко Сергій Миколайович",
  "Коваленко Марія Іванівна",
  "Бондар Олег Васильович",
  "Петренко Іван Олексійович",
  "Сидоренко Наталія Григорівна",
  "Гриценко Андрій Павлович",
  "Мороз Тетяна Володимирівна",
  "Шевченко Віктор Ігорович",
  "Кравець Людмила Степанівна",
  "Литвин Дмитро Анатолійович",
  "Романюк Ганна Юріївна",
];

/** Статус → орієнтовна вага в розподілі (переважає активна робота диспетчера). */
const COMPLAINT_STATUS_WEIGHTS: [ComplaintStatus, number][] = [
  ["REGISTERED", 25],
  ["UNDER_REVIEW", 20],
  ["FORWARDED", 20],
  ["DONE", 25],
  ["REJECTED", 4],
  ["EXTENDED", 3],
  ["ANNULLED", 3],
];

const COMPLAINT_PRIORITY_WEIGHTS: [ComplaintPriority, number][] = [
  ["HIGH", 25],
  ["MEDIUM", 45],
  ["LOW", 30],
];

const COMPLAINT_TYPE_WEIGHTS: [ComplaintType, number][] = [
  ["COMPLAINT", 60],
  ["PETITION", 20],
  ["PROPOSAL", 20],
];

/** Ланцюжок статусів, через які пройшло звернення до фінального статусу. */
const STATUS_PROGRESSION: Record<ComplaintStatus, ComplaintStatus[]> = {
  REGISTERED: ["REGISTERED"],
  UNDER_REVIEW: ["REGISTERED", "UNDER_REVIEW"],
  FORWARDED: ["REGISTERED", "UNDER_REVIEW", "FORWARDED"],
  EXTENDED: ["REGISTERED", "UNDER_REVIEW", "FORWARDED", "EXTENDED"],
  DONE: ["REGISTERED", "UNDER_REVIEW", "FORWARDED", "DONE"],
  REJECTED: ["REGISTERED", "UNDER_REVIEW", "REJECTED"],
  ANNULLED: ["REGISTERED", "ANNULLED"],
};

function pickWeighted<T extends string>(weights: [T, number][]): T {
  const total = weights.reduce((sum, [, w]) => sum + w, 0);
  let roll = random() * total;
  for (const [value, weight] of weights) {
    if (roll < weight) return value;
    roll -= weight;
  }
  return weights[weights.length - 1][0];
}

async function seedComplaints(): Promise<void> {
  const points = await prisma.collectionPoint.findMany({
    select: {
      id: true,
      address: true,
      lat: true,
      lng: true,
      streetsServed: { select: { id: true } },
    },
  });
  const dispatchers = await prisma.staffUser.findMany({
    where: { role: "DISPATCHER" },
    select: { id: true },
  });
  const inspectors = await prisma.staffUser.findMany({
    where: { role: "INSPECTOR" },
    select: { id: true },
  });

  if (points.length === 0 || dispatchers.length === 0 || inspectors.length === 0) {
    console.log("Skipping complaint seed: missing points/dispatchers/inspectors.");
    return;
  }

  const now = Date.now();

  for (let i = 0; i < COMPLAINT_SEED_COUNT; i++) {
    const point = pick(points);
    const street = point.streetsServed[0] ?? null;
    const type = pickWeighted(COMPLAINT_TYPE_WEIGHTS);
    const finalStatus = pickWeighted(COMPLAINT_STATUS_WEIGHTS);
    const priority = pickWeighted(COMPLAINT_PRIORITY_WEIGHTS);
    const subject = pick(COMPLAINT_SUBJECTS);

    const daysAgo = random() * COMPLAINT_SPREAD_DAYS;
    const createdAt = new Date(now - daysAgo * COMPLAINT_DAY_MS);

    const { dueDate, deadlineType } = computeComplaintDeadline(type, createdAt);
    const registrationNumber = await generateRegistrationNumber(createdAt);

    const progression = STATUS_PROGRESSION[finalStatus];
    const assignedInspector = pick(inspectors);
    const isAssigned = progression.length > 1;

    let annulReason: string | undefined;
    if (finalStatus === "ANNULLED") {
      annulReason = "Звернення подано повторно за тим самим фактом";
    }

    let extendedDueDate: Date | null = null;

    const complaint = await prisma.complaint.create({
      data: {
        registrationNumber,
        type,
        subject,
        description: `${subject}. Адреса: ${point.address}. Просимо вжити заходів згідно з чинним регламентом.`,
        addressText: point.address,
        lat: point.lat,
        lng: point.lng,
        ...(street ? { street: { connect: { id: street.id } } } : {}),
        collectionPoint: { connect: { id: point.id } },
        applicantName: pick(COMPLAINT_APPLICANTS),
        applicantPhone: `+380${pick(["67", "68", "50", "63", "97"])}${String(
          1000000 + Math.floor(random() * 8999999),
        )}`,
        personalDataConsent: true,
        status: finalStatus,
        priority,
        deadlineType,
        dueDate,
        ...(isAssigned
          ? { assignedToStaff: { connect: { id: assignedInspector.id } } }
          : {}),
        isAnnulled: finalStatus === "ANNULLED",
        annulReason,
        createdAt,
      },
    });

    let stepChangedAt = createdAt;
    const versionRows: {
      complaintId: string;
      versionNumber: number;
      status: ComplaintStatus;
      authorStaffId: string | null;
      resolutionText?: string;
      changedAt: Date;
    }[] = progression.map((status, index) => {
      if (index === 0) {
        return {
          complaintId: complaint.id,
          versionNumber: 1,
          status,
          authorStaffId: null,
          changedAt: createdAt,
        };
      }
      const hoursForward = 2 + random() * 34;
      stepChangedAt = new Date(
        Math.min(stepChangedAt.getTime() + hoursForward * 60 * 60 * 1000, now),
      );
      if (status === "EXTENDED") {
        extendedDueDate = new Date(
          stepChangedAt.getTime() + 15 * COMPLAINT_DAY_MS,
        );
      }
      return {
        complaintId: complaint.id,
        versionNumber: index + 1,
        status,
        authorStaffId: index === 1 ? pick(dispatchers).id : assignedInspector.id,
        resolutionText:
          status === "DONE"
            ? "Майданчик очищено, контейнер вивезено позачергово."
            : status === "REJECTED"
              ? "Факт не підтверджено під час виїзної перевірки."
              : undefined,
        changedAt: stepChangedAt,
      };
    });

    await prisma.complaintVersion.createMany({ data: versionRows });

    if (extendedDueDate) {
      await prisma.complaint.update({
        where: { id: complaint.id },
        data: { dueDate: extendedDueDate },
      });
    }
  }

  console.log(`Seeded ${COMPLAINT_SEED_COUNT} complaints with version history.`);
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

  await seedStreetsAndCollectionPoints();
  await seedContainerSchedules();
  await seedPackageSchedules();
  await seedSortingGuide();
  await seedStaffUsers();
  await seedNews();
  await seedKnowledgeBase();
  await seedComplaints();
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
