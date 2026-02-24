import { AI_MODEL } from "@/features/ai/services/ai/model";
import { PROMPT } from "@/features/ai/services/ai/prompts";
import { isGuardBlocked, requireAnyRole } from "@/lib/auth/route-guards";
import { errorHandler, getMostRecentUserMessage } from "@/lib/utils";
import { createIdGenerator, streamText } from "ai";

export const maxDuration = 50;

export async function POST(req: Request) {
  const guard = await requireAnyRole(["admin"]);
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  try {
    const { messages } = await req.json();

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response("No user message found", {
        status: 404,
      });
    }

    const result = streamText({
      model: AI_MODEL,
      system: PROMPT,
      messages,
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      generateMessageId: createIdGenerator({
        prefix: "msgs",
      }),
      onError: process.env.NODE_ENV === "development" ? errorHandler : undefined,
    });
  } catch (error) {
    console.log(error);
    return new Response("Unexpected server error", { status: 500 });
  }
}
