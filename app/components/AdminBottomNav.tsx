'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function AdminBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === '/admin/rooms') {
      return pathname?.startsWith('/admin/rooms');
    }
    if (path === '/admin/residents') {
      return pathname?.startsWith('/admin/residents');
    }
    if (path === '/admin/payments') {
      return pathname?.startsWith('/admin/payments');
    }
    if (path === '/admin/requests') {
      return pathname?.startsWith('/admin/requests');
    }
    if (path === '/admin/rules') {
      return pathname?.startsWith('/admin/rules');
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
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex overflow-x-auto no-scrollbar justify-start items-center px-6 pt-4 pb-8 bg-[#F7F9FB]/80 backdrop-blur-2xl z-50 rounded-t-3xl shadow-[0_-8px_32px_rgba(25,28,30,0.06)] gap-6">
      <button
        onClick={() => handleNavigation('/admin/dashboard')}
        className={`flex flex-col items-center gap-1.5 flex-shrink-0 ${
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
        <span className="font-label text-[10px] font-bold tracking-tight uppercase">Dashboard</span>
      </button>
      <button
        onClick={() => handleNavigation('/admin/rooms')}
        className={`flex flex-col items-center gap-1.5 flex-shrink-0 ${
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
        <span className="font-label text-[10px] font-bold tracking-tight uppercase">Rooms</span>
      </button>
      <button
        onClick={() => handleNavigation('/admin/residents')}
        className={`flex flex-col items-center gap-1.5 flex-shrink-0 ${
          isActive('/admin/residents')
            ? 'text-[#003EC6] font-bold'
            : 'text-[#4C4E50] opacity-60'
        } hover:bg-[#F2F4F6] rounded-xl transition-all p-2 active:scale-90 tap-highlight-none`}
      >
        <span
          className="material-symbols-outlined text-xl"
          style={isActive('/admin/residents') ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          group
        </span>
        <span className="font-label text-[10px] font-bold tracking-tight uppercase">Residents</span>
      </button>

      <button
        onClick={() => handleNavigation('/admin/payments')}
        className={`flex flex-col items-center gap-1.5 flex-shrink-0 ${
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
        <span className="font-label text-[10px] font-bold tracking-tight uppercase">Payments</span>
      </button>
      <button
        onClick={() => handleNavigation('/admin/requests')}
        className={`flex flex-col items-center gap-1.5 flex-shrink-0 ${
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
        <span className="font-label text-[10px] font-bold tracking-tight uppercase">Requests</span>
      </button>
      <button
        onClick={() => handleNavigation('/admin/rules')}
        className={`flex flex-col items-center gap-1.5 flex-shrink-0 ${
          isActive('/admin/rules')
            ? 'text-[#003EC6] font-bold'
            : 'text-[#4C4E50] opacity-60'
        } hover:bg-[#F2F4F6] rounded-xl transition-all p-2 active:scale-90 tap-highlight-none`}
      >
        <span
          className="material-symbols-outlined text-xl"
          style={isActive('/admin/rules') ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          gavel
        </span>
        <span className="font-label text-[10px] font-bold tracking-tight uppercase">Rules</span>
      </button>
      <button
        onClick={() => handleNavigation('/admin/profile')}
        className={`flex flex-col items-center gap-1.5 flex-shrink-0 ${
          isActive('/admin/profile')
            ? 'text-[#003EC6] font-bold'
            : 'text-[#4C4E50] opacity-60'
        } hover:bg-[#F2F4F6] rounded-xl transition-all p-2 active:scale-90 tap-highlight-none pr-8`}
      >
        <span
          className="material-symbols-outlined text-xl"
          style={isActive('/admin/profile') ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          person
        </span>
        <span className="font-label text-[10px] font-bold tracking-tight uppercase">Profile</span>
      </button>
    </nav>
  );
}
