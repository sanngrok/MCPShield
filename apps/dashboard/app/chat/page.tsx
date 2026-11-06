import type { Metadata } from "next";
import { ChatHome } from "./chat-home";
import mark from "./mcpshield-mark.png";

export const metadata: Metadata = { title: "새 채팅" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// ?name= changes the greeting. The PNG is imported here, not in chat-home.tsx, so tests can render ChatHome under tsx.
export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { name } = await searchParams;
  const value = (Array.isArray(name) ? name[0] : name)?.trim().slice(0, 20);
  return <ChatHome name={value || "상록"} logoSrc={mark.src} />;
}
