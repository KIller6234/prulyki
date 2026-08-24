"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import type { PublicCollectionPoint } from "@/app/api/maidanchyky/route";
import { fillLevelStateFor } from "@/lib/map/fillLevelThresholds";

interface ClusterLayerProps {
  points: PublicCollectionPoint[];
  onSelect: (point: PublicCollectionPoint) => void;
}

const PRIMARY_GREEN = "#1b5e42";
const NEAR_FULL_ORANGE = "#f59e0b";
const OVERFULL_RED = "#dc2626";
const BULK_VIOLET = "#7c3aed";

function markerColorFor(point: PublicCollectionPoint): string {
  const state = fillLevelStateFor(point.fillLevelPercent);
  if (state === "overfull") return OVERFULL_RED;
  if (state === "near_full") return NEAR_FULL_ORANGE;
  if (point.isBulkWasteSite) return BULK_VIOLET;
  return PRIMARY_GREEN;
}

/** Крапля-пін з білою обводкою, тінню та іконкою контейнера всередині. */
function buildPinIcon(color: string): L.DivIcon {
  const html = `
    <svg width="30" height="38" viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg" style="display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35))">
      <path d="M12 29S3 19.2 3 11.2A9 9 0 1 1 21 11.2C21 19.2 12 29 12 29Z" fill="${color}" stroke="white" stroke-width="1.8"/>
      <circle cx="12" cy="11.2" r="6.2" fill="white"/>
      <rect x="8.4" y="9.4" width="7.2" height="6.2" rx="1" fill="none" stroke="${color}" stroke-width="1.3"/>
      <path d="M9.2 9.4V8.2a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1v1.2" fill="none" stroke="${color}" stroke-width="1.3"/>
      <line x1="8.4" y1="11.6" x2="15.6" y2="11.6" stroke="${color}" stroke-width="1"/>
    </svg>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize: [30, 38],
    iconAnchor: [15, 37],
  });
}

function clusterSizeFor(count: number): number {
  if (count < 10) return 36;
  if (count < 50) return 44;
  return 52;
}

function buildClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount();
  const size = clusterSizeFor(count);
  const html = `
    <div style="
      width:${size}px;height:${size}px;
      display:flex;align-items:center;justify-content:center;
      background:${PRIMARY_GREEN};
      color:white;
      font-family:inherit;
      font-weight:700;
      font-size:${count < 100 ? 14 : 12}px;
      border-radius:9999px;
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.28);
    ">${count}</div>
  `;
  return L.divIcon({ html, className: "", iconSize: [size, size] });
}

export function ClusterLayer({ points, onSelect }: ClusterLayerProps) {
  const map = useMap();

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: buildClusterIcon,
    });

    for (const point of points) {
      const marker = L.marker([point.lat, point.lng], {
        icon: buildPinIcon(markerColorFor(point)),
      });
      marker.on("click", () => onSelect(point));
      clusterGroup.addLayer(marker);
    }

    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, points, onSelect]);

  return null;
}
