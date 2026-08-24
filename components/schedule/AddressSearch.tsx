"use client";

import { useEffect, useId, useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { SearchIcon } from "@/components/icons";
import type { StreetSuggestion } from "@/app/api/streets/search/route";
import type { ApiResponse } from "@/types/api";

const AUTOCOMPLETE_DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

interface AddressSearchProps {
  initialStreet?: string;
  onSearch: (streetName: string) => void;
  isSearching?: boolean;
}

export function AddressSearch({
  initialStreet,
  onSearch,
  isSearching,
}: AddressSearchProps) {
  const [query, setQuery] = useState(initialStreet ?? "");
  const [suggestions, setSuggestions] = useState<StreetSuggestion[]>([]);
  const [isSuggestionListOpen, setIsSuggestionListOpen] = useState(false);
  const debouncedQuery = useDebounce(query, AUTOCOMPLETE_DEBOUNCE_MS);
  const listboxId = useId();

  useEffect(() => {
    if (debouncedQuery.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    fetch(`/api/streets/search?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json() as Promise<ApiResponse<StreetSuggestion[]>>)
      .then((body) => setSuggestions(body.data ?? []))
      .catch(() => {
        // Autocomplete is a soft-fail affordance — a failed suggestion
        // fetch should not block manual free-text search below.
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSuggestionListOpen(false);
    if (query.trim()) onSearch(query.trim());
  };

  const handleSelectSuggestion = (name: string) => {
    setQuery(name);
    setIsSuggestionListOpen(false);
    onSearch(name);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <label htmlFor="address-search-input" className="sr-only">
        Назва вулиці
      </label>
      <div className="flex items-center rounded-full border border-gray-200 bg-white py-1.5 pr-1.5 pl-4 shadow-sm focus-within:border-primary-400">
        <SearchIcon className="h-5 w-5 shrink-0 text-gray-400" />
        <input
          id="address-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsSuggestionListOpen(true);
          }}
          onFocus={() => setIsSuggestionListOpen(true)}
          onBlur={() =>
            setTimeout(() => setIsSuggestionListOpen(false), 150)
          }
          placeholder="Наприклад: Соборна"
          role="combobox"
          aria-expanded={isSuggestionListOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="shrink-0 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {isSearching ? "Пошук…" : "Знайти графік"}
        </button>
      </div>

      {isSuggestionListOpen && suggestions.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          className="card absolute z-10 mt-2 w-full overflow-hidden py-1"
        >
          {suggestions.map((suggestion) => (
            <li key={suggestion.id} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectSuggestion(suggestion.name)}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-primary-50"
              >
                {suggestion.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
