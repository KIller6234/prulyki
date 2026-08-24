import { staticTileUrl } from "@/lib/geo/staticTileUrl";
import { MapPinIcon } from "@/components/icons";

interface StaticTileThumbnailProps {
  lat: number;
  lng: number;
  sizeClassName?: string;
}

/** Мініатюра мапи (один тайл OSM) із піном по центру — без завантаження Leaflet. */
export function StaticTileThumbnail({
  lat,
  lng,
  sizeClassName = "h-14 w-14",
}: StaticTileThumbnailProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg bg-gray-100 ${sizeClassName}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={staticTileUrl(lat, lng)}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
      />
      <MapPinIcon
        className="absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-full text-red-600 drop-shadow"
        fill="currentColor"
      />
    </div>
  );
}
