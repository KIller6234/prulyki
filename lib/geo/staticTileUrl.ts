const DEFAULT_ZOOM = 15;

/** URL одного тайла OSM, що містить задану точку — легка мініатюра-мапа без завантаження Leaflet. */
export function staticTileUrl(
  lat: number,
  lng: number,
  zoom: number = DEFAULT_ZOOM,
): string {
  const latRad = (lat * Math.PI) / 180;
  const n = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return `https://a.tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}
