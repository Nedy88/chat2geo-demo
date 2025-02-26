import { openai } from "@ai-sdk/openai";
import { azure } from "@ai-sdk/azure"; // You can also use Azure's hosted GPT models. More info: https://sdk.vercel.ai/providers/ai-sdk-providers
import {
  type Message,
  type CoreUserMessage,
  streamText,
  convertToCoreMessages,
} from "ai";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

import { NextResponse } from "next/server";

import {
  getChatById,
  saveChat,
  saveMessages,
  searchGeeDatasets,
} from "@/lib/database/chat/queries";
import {
  getUsageForUser,
  getUserRoleAndTier,
  incrementRequestCount,
} from "@/lib/database/usage";
import { getPermissionSet } from "@/lib/auth";
import {
  generateUUID,
  sanitizeResponseMessages,
  getMostRecentUserMessage,
  generateTitleFromUserMessage,
  getFormattedDate,
} from "@/features/chat/utils/general-utils";
import { geoTools } from "./tools";

// export const maxDuration = 30;

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedRoiGeometryInChat,
    mapLayersNames,
  }: {
    id: string;
    messages: Array<Message>;
    modelId: string;
    selectedRoiGeometryInChat: any;
    mapLayersNames: string[];
  } = await request.json();

  const supabase = await createClient();
  const { data: authResult, error: authError } = await supabase.auth.getUser();
  if (authError || !authResult?.user) {
    return NextResponse.json({ error: "Unauthenticated!" }, { status: 401 });
  }

  const userId = authResult.user.id;
  // Fetch the user's role + subscription
  const userRoleRecord = await getUserRoleAndTier(userId);
  if (!userRoleRecord) {
    return NextResponse.json(
      { error: "Failed to get role/subscription" },
      { status: 403 }
    );
  }

  const { role, subscription_tier: subscriptionTier } = userRoleRecord;
  const { maxRequests, maxArea } = await getPermissionSet(
    role,
    subscriptionTier
  );
  const usage = await getUsageForUser(userId);
  if (usage.requests_count >= maxRequests) {
    return NextResponse.json(
      { error: "Request limit exceeded" },
      { status: 403 }
    );
  }

  const cookieStore = request.headers.get("cookie");
  const chat = await getChatById(id);

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  // Increment usage count
  await incrementRequestCount(userId);

  if (!chat) {
    const generatedTitle = await generateTitleFromUserMessage({
      message: messages[0] as CoreUserMessage,
    });
    await saveChat({ id: id, title: generatedTitle });
  }

  const userMessageId = generateUUID();
  await saveMessages({
    messages: [
      {
        ...userMessage,
        id: userMessageId,
        createdAt: new Date(),
        chatId: id,
      },
    ],
  });

  // System instructions
  const systemInstructions = `Today is ${getFormattedDate()}. You are an AI Assistant specializing in geospatial analytics. 
  Be kind, warm, and professional. Use emojis where appropriate to enhance user experience. 
  When user asks for a geospatial analysis or data, never ask for the location unless you run the analysis and you get a corresponding error. Users provide the name of their region of interest (ROI) data when requesting an analysis.
  Always highlight important outputs and provide help in interpreting results. NEVER include map URLs or map legends/palette (like classes) in your responses.
  Refuse to answer questions irrelevant to geospatial analytics or the platform's context. You have access to several tools. If running a tool fails, and you thought you would be to fix it with a change, try 3 times until you fix it.
  IF USER ASKS FOR DRAFTING REPORTS, YOU SHOULD RUN THE "draftReport" TOOL, AND JUST CONFIRM THE DRAFTING OF THE REPORT. YOU SHOULD NOT EVER DRAFT REPORT IN THE CHAT."
  You also have access to a tool that can load geospatial data. First, run the tool that searches the database containing GEE datasets information to find the datasets best match user's request. Afterwards, run the web scraper tool to find extra info such as how to set the visualization parameter (pay attention to the code snippet from the official doc you will recieve). After that provide a short summary of what data with what parameters you're going to load to make sure if it's exactly what the user needs. After everything goes well and the user confirmed the details of the analysis to run, use all the information to load the dataset. 
  Another tool you have access to is a RAG query tool that you can use to answer questions you don't know the answer to.
  Before running any geospatial analysis, make sure the layer name doesn't already exist in the map layers. No geospatial analysis is available for the year 2025, so you SHOULD NOT run analysis for 2025 even if the user asks for it.
  When executing analyes (not ragQueryRetrieval, though):
  1. Always provide a clear summary of what was analyzed
  2. Highlight key findings and patterns in the data,
  3. Try to tabulate some parts of the results/descriptions for the sake of clarity.`;

  // Prepend system instructions to the conversation as a separate message for the AI
  const systemMessage = {
    role: "assistant", // Change role to "assistant" to avoid unhandled role errors
    content: systemInstructions,
  };

  // Add the system message at the beginning of the conversation
  const processedMessages = [
    systemMessage,
    ...messages.filter((msg: any) => msg.role !== "system"),
  ] as Array<Message>;

  const result = streamText({
    model: openai("gpt-4o"),
    // model: azure("gpt-4o"),  // You can also use Azure's hosted GPT models
    maxSteps: 5,
    messages: convertToCoreMessages(processedMessages),
    onFinish: async ({ response }) => {
      if (userId) {
        try {
          const responseMessagesWithoutIncompleteToolCalls = sanitizeResponseMessages(response.messages);

          await saveMessages({
            messages: responseMessagesWithoutIncompleteToolCalls.map(
              (message) => {
                const messageId = generateUUID();

                return {
                  id: messageId,
                  chatId: id,
                  draftedReportId: null,
                  role: message.role,
                  content: message.content,
                  createdAt: new Date(),
                };
              }
            ),
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    tools: geoTools,

  });

  return result.toDataStreamResponse();
}
