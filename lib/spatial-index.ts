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

import geoData from "../data/geo-objects-demo.json";

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


// Check if a point is inside a polygon (simple ray casting algorithm)
export function pointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  const x = point[0], y = point[1];
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

// Line segment intersection check
function lineSegmentsIntersect(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number
): boolean {
  // Calculate the direction of the lines
  const d1x = x2 - x1;
  const d1y = y2 - y1;
  const d2x = x4 - x3;
  const d2y = y4 - y3;
  
  // Calculate the determinant
  const det = d1x * d2y - d1y * d2x;
  
  // If det is zero, lines are parallel
  if (det === 0) return false;
  
  // Calculate the parameters for the intersection point
  const s = (d1x * (y1 - y3) - d1y * (x1 - x3)) / det;
  const t = (d2x * (y1 - y3) - d2y * (x1 - x3)) / det;
  
  // Check if the intersection is within both line segments
  return s >= 0 && s <= 1 && t >= 0 && t <= 1;
}

// Check if a box intersects a polygon
function boxIntersectsPolygon(
  box: { minX: number; minY: number; maxX: number; maxY: number },
  polygon: [number, number][]
): boolean {
  // 1. Quick rejection test: if any polygon point is inside the box, they intersect
  for (const [x, y] of polygon) {
    if (x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY) {
      return true;
    }
  }

  // 2. Check if any box edge intersects any polygon edge
  // Box edges as line segments
  const boxEdges = [
    [[box.minX, box.minY], [box.maxX, box.minY]], // bottom edge
    [[box.maxX, box.minY], [box.maxX, box.maxY]], // right edge
    [[box.maxX, box.maxY], [box.minX, box.maxY]], // top edge
    [[box.minX, box.maxY], [box.minX, box.minY]]  // left edge
  ];

  // Check each box edge against each polygon edge
  for (const [boxStart, boxEnd] of boxEdges) {
    for (let i = 0; i < polygon.length - 1; i++) {
      const polyStart = polygon[i];
      const polyEnd = polygon[i + 1];

      if (lineSegmentsIntersect(
        boxStart[0], boxStart[1], boxEnd[0], boxEnd[1],
        polyStart[0], polyStart[1], polyEnd[0], polyEnd[1]
      )) {
        return true;
      }
    }
  }

  // 3. Check if the box contains the polygon entirely
  // If all polygon points are inside the box, the box contains the polygon
  const allPointsInBox = polygon.every(([x, y]) =>
    x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY
  );

  // 4. Check if the polygon contains the box entirely
  // We can check if any corner of the box is inside the polygon
  const boxCorners = [
    [box.minX, box.minY],
    [box.maxX, box.minY],
    [box.maxX, box.maxY],
    [box.minX, box.maxY]
  ];

  const anyCornerInPolygon = boxCorners.some(([x, y]) =>
    pointInPolygon([x, y], polygon)
  );

  return allPointsInBox || anyCornerInPolygon;
}

export function queryByCategoryInPolygon(
  category: string,
  polygon: [number, number][],
): GeoObject[] {
  // Get the bounding box of the polygon, only for quicker filtering.
  const polygonBBox = polygon.reduce(
    (box, [x, y]) => ({
      minX: Math.min(box.minX, x),
      minY: Math.min(box.minY, y),
      maxX: Math.max(box.maxX, x),
      maxY: Math.max(box.maxY, y),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );

  // First get the objects in the bounding box
  const potentialResults = tree.search(polygonBBox);
  const results = potentialResults
    .filter((item) => item.category === category)
    .filter((item) => {
      return boxIntersectsPolygon({ minX: item.minX, minY: item.minY, maxX: item.maxX, maxY: item.maxY }, polygon);
    });

  return results.map((item) => ({
    category: item.category,
    long_min: item.minX,
    long_max: item.maxX,
    lat_min: item.minY,
    lat_max: item.maxY,
  }));

}

initSpatialIndex();
