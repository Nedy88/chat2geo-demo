"use client";

import { useEffect, useRef } from "react";
import { Map, ScaleControl, AttributionControl } from "maplibre-gl";
import { initializeMap } from "@/features/maps/utils/initialize-map";
import { setupMapAttributions } from "@/features/maps/utils/setup-map-attributions";
import useMapLayersStore from "../../stores/use-map-layer-store";

interface UseMapInitializationProps {
  containerId: string;
  setMapInstance: (map: Map | null) => void;
  googleSatelliteAttributionRef: React.RefObject<AttributionControl | null>;
  osmAttributionRef: React.RefObject<AttributionControl | null>;
  googleAttributionRef: React.RefObject<AttributionControl | null>;
}

export default function useMapInitialization({
  containerId,
  setMapInstance,
  googleSatelliteAttributionRef,
  osmAttributionRef,
  googleAttributionRef,
}: UseMapInitializationProps) {
  const mapInstanceRef = useRef<Map | null>(null);

  const mapCurrent = useMapLayersStore((state) => state.mapCurrent);
  const setMapCurrent = useMapLayersStore((state) => state.setMapCurrent);
  const setMapLoaded = useMapLayersStore((state) => state.setMapLoaded);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!mapCurrent && container) {
      const map = initializeMap(containerId);
      mapInstanceRef.current = map;
      setMapCurrent(map);

      map.on("load", () => {
        setMapLoaded(true);
      });

      // Add this code after map creation but before using any text layers:
      map.once('style.load', () => {
        // Get the current style
        const style = map.getStyle();

        // Add a glyphs property if it doesn't exist
        if (!style.glyphs) {
          style.glyphs = "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf";
          // Apply the updated style
          map.setStyle(style);
        }
      });

      // Example: Add scale control
      map.addControl(
        new ScaleControl({ maxWidth: 80, unit: "metric" }),
        "bottom-left"
      );

      // Setup attributions
      setupMapAttributions(
        map,
        googleSatelliteAttributionRef,
        osmAttributionRef,
        googleAttributionRef
      );

      setMapInstance(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapInstance(null);
        setMapCurrent(null);
        setMapLoaded(false);
      }
    };
  }, []);
}
