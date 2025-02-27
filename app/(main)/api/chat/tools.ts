import { calculateGeometryArea, checkGeometryAreaIsLessThanThreshold } from "@/features/maps/utils/geometry-utils";
import { GeoObject, queryByCategoryInPolygon } from "@/lib/spatial-index";
import { queryObjects } from "v8";
import { z } from "zod";

function implListObjectsInArea(category: string, selectedRoiGeometryInChat: any, maxArea: number) {
  const selectedRoiGeometry = selectedRoiGeometryInChat?.geometry;
  if (!selectedRoiGeometry) {
    return {
      error:
        "It seems you didn't provide a valid region of interest (ROI) for the analysis. you need to provide an ROI through importing a shapefile/geojson file or drawing a shape on the map.",
    };
  }

  if (
    selectedRoiGeometry.type !== "Polygon" &&
    selectedRoiGeometry.type !== "MultiPolygon" &&
    selectedRoiGeometry.type !== "FeatureCollection"
  ) {
    return {
      error:
        "Selected ROI geometry must be a Polygon, MultiPolygon, or a FeatureCollection of polygons.",
    };
  }

  // If it's a FeatureCollection, ensure every feature's geometry is a Polygon or MultiPolygon.
  if (selectedRoiGeometry.type === "FeatureCollection") {
    for (const feature of selectedRoiGeometry.features) {
      if (
        !feature.geometry ||
        (feature.geometry.type !== "Polygon" &&
          feature.geometry.type !== "MultiPolygon")
      ) {
        return {
          error: "All features in the ROI must be polygons.",
        };
      }
    }
  }

  const geometryAreaCheckResult = checkGeometryAreaIsLessThanThreshold(
    selectedRoiGeometryInChat?.geometry,
    maxArea
  );

  const areaSqKm = calculateGeometryArea(selectedRoiGeometryInChat?.geometry);
  if (!geometryAreaCheckResult) {
    return {
      error: `The area of the selected region of interest (ROI) is ${areaSqKm} sq km, which exceeds the maximum area limit of ${maxArea} sq km. Please select a smaller ROI and try again.`,
    };
  }
  const boxes = queryByCategoryInPolygon(category, selectedRoiGeometry.coordinates[0]);

  return {
    boxes: boxes,
  };
}

const listObjectsInAreaTool = (selectedRoiGeometryInChat: any, maxArea: number) => ({
  description: `List all geo objects of a specific category in a given area defined by a polygon.
    Do not worry about the regoin of interest (ROI polygon) it will be provided automatically to the tool.
      The returned value will be a list of objects containing the following fields:
      - category: string
      - long_min: number
      - long_max: number
      - lat_min: number
      - lat_max: number.
      Provide a clear and succinct summary of the results like the count of the objects.
      Provide a markdown formatted table with the results,
      but only if the number of results is less then 6.`,
  parameters: z.object({
    category: z.string()
      .describe(`The category of object to list. It can be one of the following:
          'Agricultural field',
          'Airplane',
          'Airplanes',
          'Airport',
          'Airport Runway',
          'Building',
          'Construction Site',
          'Forest',
          'Highway',
          'Industrial Warehouse',
          'Industrial building',
          'Industrial facility',
          'Industrial storage',
          'Industrial/Warehouse',
          'Lake',
          'Lava Flow',
          'Park',
          'Parked cars',
          'Parking Lot',
          'Paved road',
          'Pavement',
          'Pedestrian',
          'Person',
          'Pond',
          'Residential building',
          'Residential buildings',
          'River',
          'Road',
          'Roadway',
          'Rocky Coastline',
          'Solar panels',
          'Stainless steel refrigerator',
          'Swimming pool',
          'Tennis court',
          'Tree',
          'Unrecognized',
          'Vegetation',
          'Vehicle',
          'Vehicles'.`),
  }),
  execute: async ({ category }: { category: string }) => {
    return implListObjectsInArea(category, selectedRoiGeometryInChat, maxArea);
  },
});

export const geoTools = (selectedRoiGeometryInChat: any, maxArea: number) => ({
  listObjectsInArea: listObjectsInAreaTool(selectedRoiGeometryInChat, maxArea),
})
