"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/icons";

export interface SortingGuideListItem {
  id: string;
  name: string;
  category: string;
  description: string;
  howToSort: string;
  isRecyclable: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  MIXED: "Змішані",
  PLASTIC: "Пластик",
  GLASS: "Скло",
  PAPER: "Папір",
  BULK: "ВГВ",
};

interface SortingGuideListProps {
  items: SortingGuideListItem[];
}

export function SortingGuideList({ items }: SortingGuideListProps) {
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(normalizedQuery),
    );
  }, [items, query]);

  return (
    <div>
      <label htmlFor="sorting-guide-search" className="sr-only">
        Пошук за назвою відходу
      </label>
      <div className="mb-6 flex max-w-md items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pr-4 pl-4 shadow-sm focus-within:border-primary-400">
        <SearchIcon className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          id="sorting-guide-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук, наприклад: пляшка"
          className="w-full border-0 bg-transparent py-1 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-sm text-gray-500">
          Нічого не знайдено за запитом «{query}».
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {filteredItems.map((item) => (
            <li key={item.id} className="card p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </span>
              </div>
              <p className="text-sm text-gray-500">{item.description}</p>
              <p className="mt-2 text-sm font-medium text-primary-700">
                {item.howToSort}
              </p>
              {!item.isRecyclable ? (
                <p className="mt-1 text-xs text-amber-700">
                  Стандартна переробка недоступна
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
