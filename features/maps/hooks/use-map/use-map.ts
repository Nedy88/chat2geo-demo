"use client";

import { useState, useRef } from "react";
import { Map, AttributionControl } from "maplibre-gl";
import useMapInitialization from "./use-map-initialization";
import useAddGeeLayers from "./use-add-gee-layers";
import useAddRoiFromSession from "./use-add-roi-from-session";
import { useUpdateLayerColor } from "./use-update-layer-style";
import useZoomToGeometry from "./use-zoom-to-geometry";
import { useButtonsStore } from "@/stores/use-buttons-store";
import useBasemapToggle from "./use-basemap-toggle";
import useAddArcGisLayers from "./use-add-arcgis-layers";
import useAddAttachedLayers from "./use-add-attached-layers";
import useAddBoundingBoxes from "./use-add-bounding-boxes";

export default function useMap(containerId: string) {
  // We keep this in useState in case you need to return or further manipulate the map
  const [mapInstance, setMapInstance] = useState<Map | null>(null);

  const activeBasemap = useButtonsStore((state) => state.activeBasemap);
  // References for attributions
  const googleSatelliteAttributionRef = useRef<AttributionControl | null>(null);
  const osmAttributionRef = useRef<AttributionControl | null>(null);
  const googleAttributionRef = useRef<AttributionControl | null>(null);

  // Initialize map
  useMapInitialization({
    containerId,
    setMapInstance,
    googleSatelliteAttributionRef,
    osmAttributionRef,
    googleAttributionRef,
  });

  // Add GEE layers
  useAddGeeLayers(mapInstance);

  useAddBoundingBoxes(mapInstance);

  useAddArcGisLayers(mapInstance);

  useAddAttachedLayers(mapInstance);

  // Add ROI from session
  useAddRoiFromSession(mapInstance);

  // Update layer color
  useUpdateLayerColor(mapInstance);

  // Zoom to geometry (table feature or drawn geometry)
  useZoomToGeometry(mapInstance);

  // Basemap toggle
  useBasemapToggle({
    mapInstance,
    googleSatelliteAttributionRef,
    osmAttributionRef,
    googleAttributionRef,
  });

  return {
    mapInstance,
    googleSatelliteAttributionRef,
    osmAttributionRef,
    googleAttributionRef,
  };
}
