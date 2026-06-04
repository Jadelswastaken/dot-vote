import { useTheme } from "../hooks/useTheme";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className="shadow-block-static relative flex items-center gap-3 px-6 py-4 h-10 w-20 cursor-pointer bg-viridian duration-300 ease-out"
    >
      <div
        className={`absolute top-1/2 -translate-y-1/3 w-9 h-9 bg-plum transition-transform duration-300 ease-out rounded-full shadow-block-static
          ${isDark ? "translate-x-8" : "-translate-x-1"}`}
        style={{ left: "0.5rem" }}
        aria-hidden
      />
      <Sun className="absolute bottom-0.25 left-2.5 z-10 dark:top-2 dark:left-2 dark:hover:text-hopbush" />
      <Moon className="absolute dark:bottom-0.25 right-2 z-10 hover:text-hopbush dark:hover:text-white" />
    </button>
  );
}
