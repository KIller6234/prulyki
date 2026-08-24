import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/**
 * Leaflet's default marker icon resolves image paths relative to the CSS
 * file at runtime, which breaks under Next.js bundling. This patches the
 * default icon to use bundler-resolved asset URLs instead.
 */
export function fixLeafletDefaultIcon(): void {
  const iconPrototype = L.Icon.Default.prototype as L.Icon.Default & {
    _getIconUrl?: unknown;
  };
  delete iconPrototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src,
    iconUrl: markerIcon.src,
    shadowUrl: markerShadow.src,
  });
}
