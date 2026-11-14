"use client";

import { useState } from "react";
import Icon from "./Icon";

export default function CopyButton({ text, label = "copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      setDone(false);
    }
  }

  return (
    <button type="button" className="btn btn-secondary btn-sm" onClick={copy}>
      <Icon name={done ? "check" : "copy"} size={14} />
      {done ? "copied" : label}
    </button>
  );
}
