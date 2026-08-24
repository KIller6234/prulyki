"use client";

import { useRouter } from "next/navigation";
import { AddressSearch } from "./AddressSearch";

export function HomeAddressSearchBar() {
  const router = useRouter();

  return (
    <AddressSearch
      onSearch={(streetName) =>
        router.push(`/grafik?street=${encodeURIComponent(streetName)}`)
      }
    />
  );
}
