import RBush from "rbush";

export interface GeoObject {
  category: string;
  long_min: number;
  long_max: number;
  lat_min: number;
  lat_max: number;
}

// Define the type for RBush entries
interface RBushEntry {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  category: string;
}

// Create a spatial index of our data
const tree = new RBush<RBushEntry>();

import geoData from "../data/geo-objects-dummy.json";

export function initSpatialIndex() {
  const entries: RBushEntry[] = geoData.map((obj) => ({
    minX: obj.long_min,
    minY: obj.lat_min,
    maxX: obj.long_max,
    maxY: obj.lat_max,
    category: obj.category,
  }));

  tree.load(entries);
  console.log(`Loaded ${entries.length} entries into the spatial index`);
}

