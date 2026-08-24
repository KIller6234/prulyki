import { prisma } from "@/lib/db";
import { SortingGuideList } from "@/components/sorting/SortingGuideList";
import { SortingIcon } from "@/components/icons";

// force-dynamic (не ISR): "revalidate" вимагав би доступу до БД під час
// next build, що ламає білд на хостингах без БД, піднятої в момент білда
// (Netlify, Docker builder-стадія). Трафік малий — рендер на кожен запит
// не є проблемою продуктивності.
export const dynamic = "force-dynamic";

export default async function PravylaSortuvannyaPage() {
  const items = await prisma.sortingGuideItem.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary-200 text-primary-600">
          <SortingIcon className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          Правила сортування відходів
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Знайдіть вид відходу та дізнайтеся, куди його правильно віднести.
        </p>
      </header>
      <SortingGuideList items={items} />
    </main>
  );
}
