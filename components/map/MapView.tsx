"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { PublicCollectionPoint } from "@/app/api/maidanchyky/route";
import { fixLeafletDefaultIcon } from "./leafletIconFix";
import { ClusterLayer } from "./ClusterLayer";

const PRYLUKY_CENTER: [number, number] = [50.583, 32.383];
const DEFAULT_ZOOM = 13;

interface MapViewProps {
  points: PublicCollectionPoint[];
  onSelectPoint: (point: PublicCollectionPoint) => void;
}

export function MapView({ points, onSelectPoint }: MapViewProps) {
  const [isIconReady, setIsIconReady] = useState(false);

  useEffect(() => {
    fixLeafletDefaultIcon();
    setIsIconReady(true);
  }, []);

  if (!isIconReady) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500">
        Завантаження мапи…
      </div>
    );
  }

  return (
    <MapContainer
      center={PRYLUKY_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      aria-label="Мапа контейнерних майданчиків Прилук"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClusterLayer points={points} onSelect={onSelectPoint} />
    </MapContainer>
  );
}
