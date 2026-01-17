"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  if (theme === "dark") html.classList.add("dark");
  else html.classList.remove("dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initial: Theme =
      saved === "light" || saved === "dark" ? saved : prefersDark ? "dark" : "light";

    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("theme", next);
  }

  return (
    <button
      onClick={toggle}
      className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-secondary hover:opacity-90"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
