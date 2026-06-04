import { useTheme } from "../hooks/useTheme";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className="relative flex items-center gap-3 px-6 py-4 h-11 w-18 cursor-pointer bg-viridian duration-300 ease-out"
    >
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-9 h-9 bg-plum transition-transform duration-300 ease-out rounded-full
          ${isDark ? "translate-x-6" : "-translate-x-1"}`}
        style={{ left: "0.5rem" }}
        aria-hidden
      />
      <Sun className="absolute left-3 z-10 text-ink" />
      <Moon className="absolute right-3 z-10 text-ink" />
    </button>
  );
};

export default ThemeToggle;
