import "./chat.css";

// /chat is a light chat-app mock that hands off to the MCPShield site; its own root layout keeps the site's dark CSS
// and fonts out, and the jump to / is a full page load between root layouts.
export default function ChatRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
