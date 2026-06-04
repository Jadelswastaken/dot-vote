import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

interface HeaderProps {
  user?: string | null;
  onLogout?: () => void;
  onSignIn?: () => void;
}

const Header = ({ user, onLogout, onSignIn }: HeaderProps) => {
  return (
    <header className="flex flex-row justify-between items-center bg-dusty-blue m-4 shadow-block-static px-6 py-3">
      <img
        src="/dot-vote-wide.svg"
        alt="Dot Vote logo"
        className="h-12 w-auto"
      />
      <div className="flex items-center gap-4">
        <ThemeToggle />
        {user ? (
          <UserMenu user={user} onLogout={onLogout} />
        ) : (
          <button
            onClick={onSignIn}
            className="bg-hopbush px-4 py-2 text-sm font-mono cursor-pointer shadow-block-dynamic"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
