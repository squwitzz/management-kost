'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function UserBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === '/profile') {
      return pathname === '/profile';
    }
    if (path === '/rules') {
      return pathname === '/rules';
    }
    return pathname === path;
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-4 pb-8 bg-[#F7F9FB]/70 backdrop-blur-xl z-50 rounded-t-3xl shadow-[0_-8px_32px_rgba(25,28,30,0.04)]">
      <button
        onClick={() => handleNavigation('/dashboard')}
        className={`flex flex-col items-center gap-1 ${
          isActive('/dashboard')
            ? 'text-[#003EC6] font-bold'
            : 'text-[#4C4E50] opacity-60'
        } hover:bg-[#F2F4F6] rounded-xl transition-all p-2 active:scale-90 tap-highlight-none`}
      >
        <span
          className="material-symbols-outlined"
          style={isActive('/dashboard') ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          dashboard
        </span>
        <span className="font-label text-[10px] font-medium tracking-wide uppercase">Dashboard</span>
      </button>
      <button
        onClick={() => handleNavigation('/payments')}
        className={`flex flex-col items-center gap-1 ${
          isActive('/payments')
            ? 'text-[#003EC6] font-bold'
            : 'text-[#4C4E50] opacity-60'
        } hover:bg-[#F2F4F6] rounded-xl transition-all p-2 active:scale-90 tap-highlight-none`}
      >
        <span
          className="material-symbols-outlined"
          style={isActive('/payments') ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          receipt_long
        </span>
        <span className="font-label text-[10px] font-medium tracking-wide uppercase">Payments</span>
      </button>
      <button
        onClick={() => handleNavigation('/requests')}
        className={`flex flex-col items-center gap-1 ${
          isActive('/requests')
            ? 'text-[#003EC6] font-bold'
            : 'text-[#4C4E50] opacity-60'
        } hover:bg-[#F2F4F6] rounded-xl transition-all p-2 active:scale-90 tap-highlight-none`}
      >
        <span
          className="material-symbols-outlined"
          style={isActive('/requests') ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          build
        </span>
        <span className="font-label text-[10px] font-medium tracking-wide uppercase">Requests</span>
      </button>
      <button
        onClick={() => handleNavigation('/rules')}
        className={`flex flex-col items-center gap-1 ${
          isActive('/rules')
            ? 'text-[#003EC6] font-bold'
            : 'text-[#4C4E50] opacity-60'
        } hover:bg-[#F2F4F6] rounded-xl transition-all p-2 active:scale-90 tap-highlight-none`}
      >
        <span
          className="material-symbols-outlined"
          style={isActive('/rules') ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          rule
        </span>
        <span className="font-label text-[10px] font-medium tracking-wide uppercase">Rules</span>
      </button>
      <button
        onClick={() => handleNavigation('/profile')}
        className={`flex flex-col items-center gap-1 ${
          isActive('/profile')
            ? 'text-[#003EC6] font-bold'
            : 'text-[#4C4E50] opacity-60'
        } hover:bg-[#F2F4F6] rounded-xl transition-all p-2 active:scale-90 tap-highlight-none`}
      >
        <span
          className="material-symbols-outlined"
          style={isActive('/profile') ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          person
        </span>
        <span className="font-label text-[10px] font-medium tracking-wide uppercase">Profile</span>
      </button>
    </nav>
  );
}
