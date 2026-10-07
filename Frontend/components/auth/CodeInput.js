"use client";

import { useRef, useState } from "react";

// To clear the boxes from the parent (e.g. after a wrong code), change the `key` prop.
export default function CodeInput({
  length = 6,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
}) {
  const [digits, setDigits] = useState(Array(length).fill(""));
  const refs = useRef([]);

  function commit(next, focusIndex) {
    setDigits(next);
    const joined = next.join("");
    onChange?.(joined);
    if (focusIndex != null) refs.current[focusIndex]?.focus();
    if (joined.length === length) onComplete?.(joined);
  }

  function handleInput(i, e) {
    const value = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = value;
    commit(next, value && i < length - 1 ? i + 1 : i);
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      const next = [...digits];
      next[i - 1] = "";
      commit(next, i - 1);
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = Array(length).fill("");
    text.split("").forEach((ch, idx) => (next[idx] = ch));
    commit(next, Math.min(text.length, length - 1));
  }

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={digit}
          onChange={(e) => handleInput(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          className="h-14 w-full min-w-0 rounded-xl border border-line bg-panel/60 text-center text-xl font-bold text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
        />
      ))}
    </div>
  );
}