import ThemeToggle from "./ThemeToggle";

const Header = () => {
  return (
    <header className="flex flex-row justify-between items-center bg-primary/50 border-1 border-white text-white p-4">
      <img
        src="/dot-vote-wide.svg"
        alt="Dot Vote logo"
        className="h-20 w-auto"
      />
      <ThemeToggle />
    </header>
  );
}

export default Header;