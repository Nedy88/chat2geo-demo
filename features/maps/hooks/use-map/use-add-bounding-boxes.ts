"use client";

import { Map } from "maplibre-gl";
import useMapLayersStore from "../../stores/use-map-layer-store";
import { useEffect, useRef } from "react";
import { GeoJsonProperties } from "geojson";

export default function useAddBoundingBoxes(mapInstance: Map | null) {
  const mapLayers = useMapLayersStore((state) => state.mapLayers);
  const sourcesRef = useRef<string[]>([]);
  const layersRef = useRef<string[]>([]);

  useEffect(() => {
    if (!mapInstance) return;

    // Clean up existing sources and layers
    const cleanup = () => {
      // Remove all previously added layers
      layersRef.current.forEach(layerId => {
        if (mapInstance.getLayer(layerId)) {
          mapInstance.removeLayer(layerId);
        }
      });

      // Remove all previously added sources
      sourcesRef.current.forEach(sourceId => {
        if (mapInstance.getSource(sourceId)) {
          mapInstance.removeSource(sourceId);
        }
      });

      // Clear the refs
      layersRef.current = [];
      sourcesRef.current = [];
    };

    const processBoundingBoxes = () => {
      cleanup();

      // Filter for vector layers that are visible
      const vectorLayers = mapLayers.filter(
        layer => layer.type === "boxes" && layer.visible
      );
      // Process each vector layer
      vectorLayers.forEach(layer => {
        // Get boxes from either vectorData or mapStats
        const boxes = layer.boxes ||
          (layer.mapStats?.boundingBoxes as any[] || []);

        if (boxes.length === 0) return;

        // Create a unique source ID for this layer
        const sourceId = `vector-source-${layer.id}`;
        sourcesRef.current.push(sourceId);

        // Convert boxes to GeoJSON
        const features = boxes.map(box => {
          return {
            type: "Feature",
            properties: {
              category: box.category,
              color: "red",
            } as GeoJsonProperties,
            geometry: {
              type: "Polygon",
              coordinates: [[
                [box.long_min, box.lat_min], // bottom left
                [box.long_max, box.lat_min], // bottom right
                [box.long_max, box.lat_max], // top right
                [box.long_min, box.lat_max], // top left
                [box.long_min, box.lat_min]  // close polygon
              ]]
            },
          };
        });

        // Add source
        mapInstance.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features,
          }
        });

        // Add fill layer
        const fillLayerId = `vector-fill-${layer.id}`;
        mapInstance.addLayer({
          id: fillLayerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": 0.3
          }
        });
        layersRef.current.push(fillLayerId);

        // Add outline layer
        const lineLayerId = `vector-line-${layer.id}`;
        mapInstance.addLayer({
          id: lineLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": ["get", "color"],
            "line-width": 2
          }
        });
        layersRef.current.push(lineLayerId);

        // Add labels layer
        const textLayerId = `vector-text-${layer.id}`;
        mapInstance.addLayer({
          id: textLayerId,
          type: "symbol",
          source: sourceId,
          layout: {
            "text-field": ["get", "category"],
            "text-size": 12,
            "text-anchor": "center",
            "text-allow-overlap": true
          },
          paint: {
            "text-color": "#000000",
            "text-halo-color": "#FFFFFF",
            "text-halo-width": 2
          }
        });
        layersRef.current.push(textLayerId);
      });
    };

    processBoundingBoxes();

    return cleanup;
  }, [mapInstance, mapLayers]);
}
