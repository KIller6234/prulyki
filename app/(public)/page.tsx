import Link from "next/link";
import { prisma } from "@/lib/db";
import { HomeAddressSearchBar } from "@/components/schedule/HomeAddressSearchBar";
import { AskConsultantBanner } from "@/components/chat/AskConsultantBanner";
import {
  SortingIcon,
  ScheduleIcon,
  MapPinIcon,
  ComplaintIcon,
} from "@/components/icons";

const MAIN_BLOCKS = [
  {
    href: "/pravyla-sortuvannya",
    title: "Правила сортування",
    description: "Що з яким видом відходів робити — з поясненнями.",
    Icon: SortingIcon,
  },
  {
    href: "/grafik",
    title: "Графіки вивезення",
    description: "Коли забирають сміття на вашій вулиці.",
    Icon: ScheduleIcon,
  },
  {
    href: "/mapa",
    title: "Мапа майданчиків",
    description: "Найближчі контейнерні майданчики та їх стан.",
    Icon: MapPinIcon,
  },
  {
    href: "/zvernennya",
    title: "Звернення",
    description: "Повідомити про проблему або задати питання.",
    Icon: ComplaintIcon,
  },
] as const;

// force-dynamic (не ISR): "revalidate" вимагав би доступу до БД під час
// next build, що ламає білд на хостингах без БД, піднятої в момент білда
// (Netlify, Docker builder-стадія). Трафік малий — рендер на кожен запит
// не є проблемою продуктивності.
export const dynamic = "force-dynamic";

async function getRecentNews() {
  return prisma.newsPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 4,
  });
}

export default async function HomePage() {
  const newsPosts = await getRecentNews();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-sans text-[40px] leading-tight font-extrabold text-primary-600">
          Чисті Прилуки
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-gray-500">
          Графіки вивезення, мапа контейнерних майданчиків і звернення —
          <br />
          в одному місці, без відвідування виконкому.
        </p>
        <div className="mt-7 flex justify-center">
          <HomeAddressSearchBar />
        </div>
      </header>

      <section
        aria-label="Основні розділи"
        className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-5 lg:grid-cols-4"
      >
        {MAIN_BLOCKS.map(({ href, title, description, Icon }) => (
          <Link
            key={href}
            href={href}
            className="card flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary-200 text-primary-600">
              <Icon className="h-6 w-6" />
            </span>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            <p className="text-sm leading-relaxed text-gray-500">
              {description}
            </p>
          </Link>
        ))}
      </section>

      <div className="mx-auto mt-8 max-w-5xl">
        <AskConsultantBanner />
      </div>

      <section aria-label="Новини" className="mx-auto mt-12 max-w-5xl">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          Новини та оголошення
        </h2>
        {newsPosts.length === 0 ? (
          <p className="text-sm text-gray-500">
            Наразі новин не опубліковано.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {newsPosts.map((post) => (
              <li key={post.id} className="card p-5">
                <h3 className="font-bold text-gray-800">{post.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  {post.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
