import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChatHome } from "../app/chat/chat-home";

test("/chat greets by name and hands off to the MCPShield site from the badged launcher", () => {
  const html = renderToStaticMarkup(<ChatHome name="상록" logoSrc="/mark.png" />);
  assert.match(html, /상록님, 반갑습니다\./);
  const launcher = html.match(/<a class="gpt-shield"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? "";
  assert.match(launcher, /href="\/"/);
  assert.match(launcher, /aria-label="MCP Shield 열기 · 검사가 필요한 MCP 업데이트 1건"/);
  assert.match(launcher, /<img src="\/mark.png"/);
  assert.match(launcher, /<span class="gpt-badge" aria-hidden="true">1<\/span>/);
  assert.doesNotMatch(html, /<form/, "the composer is not a form");
  assert.doesNotMatch(html, /gpt-menu/, "the + menu starts closed");
});
