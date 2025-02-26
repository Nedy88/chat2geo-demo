import { GeoObject } from "@/lib/spatial-index";
import { z } from "zod";

const listObjectsInAreaTool = {
  description: `List all geo objects of a specific category.
      The returned value will be a list of objects containing the following fields:
      - category: string
      - long_min: number
      - long_max: number
      - lat_min: number
      - lat_max: number.
      Format the output in a markdown table.`,
  parameters: z.object({
    category: z.string()
      .describe(`The category of object to list. It can be one of the following:
          'Building', 'Football playground'.`),
  }),
  execute: async ({ category }: { category: string }) => {
    console.log(`Listing objects of category ${category}`);
    const boxes = [
      {
        category: "Building",
        long_min: 23.37109148410383,
        long_max: 23.372019262661297,
        lat_min: 42.669613010609396,
        lat_max: 42.67030561974849,
      },
      {
        category: "Building",
        long_min: 23.371853587775547,
        long_max: 23.372795567025662,
        lat_min: 42.67037870801565,
        lat_max: 42.67103998514318,
      },
    ] as GeoObject[];
    return {
      boxes: boxes,
    };
  }
};

export const geoTools = {
  listObjectsInArea: listObjectsInAreaTool,
}
