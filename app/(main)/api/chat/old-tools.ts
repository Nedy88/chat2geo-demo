import { getFormattedDate } from "@/features/chat/utils/general-utils";
import { z } from "zod";
import {
  requestGeospatialAnalysis,
  requestLoadingGeospatialData,
  requestRagQuery,
  draftReport,
  requestWebScraping,
} from "@/lib/database/chat/tools";
import { Message } from "ai";

export const tools = (
  maxArea: number,
  cookieStore: string | null,
  selectedRoiGeometryInChat: any,
  processedMessages: Message[],
  mapLayersNames: string[],
) => ({
  requestGeospatialAnalysis: {
    description: `Today is ${getFormattedDate()}, so you should be able to help the user with requests by up to this date. No analysis should be done for the year of 2025 as analyses are not yet ready for the new year.
          After running an analysis: 1. Provide a clear summary of what was analyzed and why, 2. Explain the key findings and their significance. NEVER PROVIDE MAP URLs or MAP LEGENDS FROM THE ANALYSES IN THE RESPONSE. Also the maximum area the user can request analysis for is ${maxArea} sq km. per request.
          It should be noted that the land cover map (start date: 2015) and bi-temporal land cover change map (start date: 2015) are based on Sentinel-2 imagery, UHI (start date: 2015) is based on Landsat imagery. For all "CHANGE" maps, the user must provide "startDate2 and endDate2". If in doubt about an analysis (e.g., it may not exactly match the analysis we have), you have to double check with the user.`,
    parameters: z.object({
      functionType: z.string()
        .describe(`The type of analysis to execute. It can be one of the following:
            'Urban Heat Island (UHI) Analysis',
            'Land Use/Land Cover Maps',
            'Land Use/Land Cover Change Maps'.`),
      startDate1String: z
        .string()
        .describe(
          "The start date for the first period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
        ),
      endDate1String: z
        .string()
        .describe(
          "The end date for the first period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
        ),
      startDate2String: z
        .string()
        .optional()
        .describe(
          "The start date for the second period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
        ),
      endDate2String: z
        .string()
        .optional()
        .describe(
          "The end date for the second period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
        ),
      aggregationMethod: z.string().describe(
        `The method to use for aggregating the data. It means that in a time-series, what method is used to aggregate data for a given point/pixel in the final map/analysis delivered. For land use/land cover mapping, it's always "Median", and thus you don't need to ask user for that. It can be one of the following:
            'Mean',
            'Median',
            'Min',
            'Max',
            . Note that the user may not provide it, so by default its value should be 'Max', and you should not ask the user to tell you what method to use. If the default value is used, make sure to mention it in the response to user that your analysis is based on the maximum va.
          `
      ),
      layerName: z
        .string()
        .describe(
          "The name of the layer to be displayed. You ask the user about it if they don't provide it. Otherwise, use a name based on the function type, but make sure the name is concise and descriptive. "
        ),
      title: z
        .string()
        .optional()
        .describe(
          "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
        ),
    }),
    execute: async (args) => requestGeospatialAnalysis({
      ...args,
      cookieStore,
      selectedRoiGeometryInChat,
      maxArea,
    }),
  },
  requestRagQuery: {
    description: `The user has some documents with which a RAG has been built. If you're asked a question that you didn't know the answer, run the requestRagQuery tool that is based on user's documents to get the answer.`,
    parameters: z.object({
      query: z.string().describe("The user's query text."),
      title: z
        .string()
        .optional()
        .describe(
          "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
        ),
    }),
    execute: async (args) => requestRagQuery({ ...args, cookieStore }),
  },
  draftReport: {
    description: `When this tool is called, draft a report that summarizes the analyses and their results. The report should be concise and easy to understand, highlighting the key findings and insights. Markdown is supported.`,
    parameters: z.object({
      messages: z
        .array(z.object({}))
        .describe(
          "The messages exchanged between the user and the you. You should use relevant messages in the chat to generate the report the user requested. Make sure you format the report in a standard way with all the common structures."
        ),
      title: z
        .string()
        .optional()
        .describe(
          "Briefly describe the title of the report to be drafted in one sentence confirming you're working on the user's request."
        ),
      reportFileName: z
        .string()
        .optional()
        .describe("Provide a concise name for the report file."),
    }),
    execute: async (args) => draftReport({ ...args, messages: processedMessages }),
  },
  checkMapLayersNames: {
    description: "Your need to select a name for the geospatial analysis to be performed. Here are the the names of the current map layers. If you run a geospatial analysis, and you select a name fo the layer, you should should first check the layer names to make sure the name you selected is not already in use.",
    parameters: z.object({
      layerName: z
        .string()
        .describe("The name of the layer to be displayed."),
    }),

    execute: async (args) => {
      return mapLayersNames;
    },
  },
});
