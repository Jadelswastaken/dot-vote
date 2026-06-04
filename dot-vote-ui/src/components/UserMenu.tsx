import { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";

interface UserMenuProps {
  user: string | null;
  onLogout?: () => void;
}

const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="group bg-hopbush h-10 w-10 flex items-center justify-center rounded-full shadow-block-dynamic cursor-pointer border-none p-0"
        title={user ?? undefined}
      >
        <User className="w-5 h-5" />
        <span className="z-50 absolute bg-ink text-white text-[0.65rem] font-mono px-2 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
          {user}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 bg-hopbush shadow-block-dynamic min-w-[140px] z-20">

          <button
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            className="w-full text-left px-4 py-2 text-xs font-mono cursor-pointer "
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
