'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function AdminBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === '/admin/rooms') {
      return pathname?.startsWith('/admin/rooms');
    }
    if (path === '/admin/payments') {
      return pathname?.startsWith('/admin/payments');
    }
    if (path === '/admin/requests') {
      return pathname?.startsWith('/admin/requests');
    }
    if (path === '/admin/profile') {
      return pathname?.startsWith('/admin/profile');
    }
    return pathname === path;
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-4 pb-8 bg-[#F7F9FB]/70 backdrop-blur-xl z-50 rounded-t-3xl shadow-[0_-8px_32px_rgba(25,28,30,0.04)]">
      <button
        onClick={() => handleNavigation('/admin/dashboard')}
        className={`flex flex-col items-center gap-1 ${
          isActive('/admin/dashboard')
            ? 'text-[#003EC6] font-bold'
            : 'text-[#4C4E50] opacity-60'
        } hover:bg-[#F2F4F6] rounded-xl transition-all p-2 active:scale-90 tap-highlight-none`}
      >
        <span
          className="material-symbols-outlined text-xl"
          style={isActive('/admin/dashboard') ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          grid_view
        </span>
        <span className="font-label text-[9px] font-medium tracking-wide uppercase">Dashboard</span>
      </button>
      <button
        onClick={() => handleNavigation('/admin/rooms')}
        className={`flex flex-col items-center gap-1 ${
          isActive('/admin/rooms')
            ? 'text-[#003EC6] font-bold'
            : 'text-[#4C4E50] opacity-60'
        } hover:bg-[#F2F4F6] rounded-xl transition-all p-2 active:scale-90 tap-highlight-none`}
      >
        <span
          className="material-symbols-outlined text-xl"
          style={isActive('/admin/rooms') ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          door_front
        </span>
        <span className="font-label text-[9px] font-medium tracking-wide uppercase">Rooms</span>
      </button>
      <button
        onClick={() => handleNavigation('/admin/payments')}
        className={`flex flex-col items-center gap-1 ${
          isActive('/admin/payments')
            ? 'text-[#003EC6] font-bold'
            : 'text-[#4C4E50] opacity-60'
        } hover:bg-[#F2F4F6] rounded-xl transition-all p-2 active:scale-90 tap-highlight-none`}
      >
        <span
          className="material-symbols-outlined text-xl"
          style={isActive('/admin/payments') ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          payments
        </span>
        <span className="font-label text-[9px] font-medium tracking-wide uppercase">Payments</span>
      </button>
      <button
        onClick={() => handleNavigation('/admin/requests')}
        className={`flex flex-col items-center gap-1 ${
          isActive('/admin/requests')
            ? 'text-[#003EC6] font-bold'
            : 'text-[#4C4E50] opacity-60'
        } hover:bg-[#F2F4F6] rounded-xl transition-all p-2 active:scale-90 tap-highlight-none`}
      >
        <span
          className="material-symbols-outlined text-xl"
          style={isActive('/admin/requests') ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          build
        </span>
        <span className="font-label text-[9px] font-medium tracking-wide uppercase">Requests</span>
      </button>
      <button
        onClick={() => handleNavigation('/admin/profile')}
        className={`flex flex-col items-center gap-1 ${
          isActive('/admin/profile')
            ? 'text-[#003EC6] font-bold'
            : 'text-[#4C4E50] opacity-60'
        } hover:bg-[#F2F4F6] rounded-xl transition-all p-2 active:scale-90 tap-highlight-none`}
      >
        <span
          className="material-symbols-outlined text-xl"
          style={isActive('/admin/profile') ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          person
        </span>
        <span className="font-label text-[9px] font-medium tracking-wide uppercase">Profile</span>
      </button>
    </nav>
  );
}
