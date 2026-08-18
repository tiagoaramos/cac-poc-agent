import { LLMMessage } from "./types";

export function findUserMessage(messages: LLMMessage[]): string {
  const user = [...messages].reverse().find((message) => message.role === "user");
  return user?.content || "";
}
