"use client";

import katex from "katex";
import { Fragment } from "react";

interface MathRichTextProps {
  content?: string | null;
  className?: string;
  as?: "div" | "span";
}

type MathToken =
  | { type: "text"; value: string }
  | { type: "math"; value: string; displayMode: boolean };

const MATH_PATTERN = /\\\[((?:\\.|[\s\S])*?)\\\]|\\\(((?:\\.|[\s\S])*?)\\\)/g;

function tokenizeMathContent(content: string): MathToken[] {
  const tokens: MathToken[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(MATH_PATTERN)) {
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      tokens.push({ type: "text", value: content.slice(lastIndex, matchIndex) });
    }

    tokens.push({
      type: "math",
      value: (match[1] ?? match[2] ?? "").trim(),
      displayMode: Boolean(match[1])
    });

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < content.length) {
    tokens.push({ type: "text", value: content.slice(lastIndex) });
  }

  return tokens;
}

function renderMathToHtml(expression: string, displayMode: boolean) {
  try {
    return katex.renderToString(expression, {
      displayMode,
      output: "html",
      throwOnError: false,
      strict: "ignore"
    });
  } catch {
    return null;
  }
}

export function MathRichText({ content, className, as = "div" }: MathRichTextProps) {
  if (!content?.trim()) {
    return null;
  }

  const tokens = tokenizeMathContent(content);
  const TagName = as;

  return (
    <TagName className={className}>
      {tokens.map((token, index) => {
        if (token.type === "text") {
          return <Fragment key={`text-${index}`}>{token.value}</Fragment>;
        }

        const renderedHtml = renderMathToHtml(token.value, token.displayMode);

        if (!renderedHtml) {
          return <Fragment key={`fallback-${index}`}>{token.value}</Fragment>;
        }

        if (token.displayMode) {
          return (
            <div
              key={`display-${index}`}
              className="my-3 overflow-x-auto overflow-y-hidden"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          );
        }

        return (
          <span
            key={`inline-${index}`}
            className="inline-block max-w-full align-middle"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        );
      })}
    </TagName>
  );
}
