'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  {
    href: '/',
    label: 'Overview',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/departments',
    label: 'Departments',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/universities',
    label: 'Universities',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    href: '/products',
    label: 'Products',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 md:py-8 border-b border-white/5">
        <div className="flex items-center gap-4 md:gap-5">
          <div className="w-14 h-14 md:w-20 md:h-20 flex-shrink-0 flex items-center justify-center overflow-hidden">
            <Image
              src="/assets/logo.png"
              alt="Website Logo"
              width={80}
              height={80}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-xs uppercase tracking-wider leading-tight" style={{ color: '#FFFFFF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Marketing Physical</p>
            <p className="font-bold text-xs uppercase tracking-wider leading-tight" style={{ color: '#FFFFFF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Campaigns</p>
            <p className="text-[10px] mt-1 font-semibold whitespace-nowrap" style={{ color: '#A0AEC0' }}>Performance Tracker</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-widest px-3 mb-4" style={{ color: '#A0AEC0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Dashboard</p>
        {NAV.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
              style={{
                color: active ? '#FFFFFF' : '#A0AEC0',
                background: active
                  ? 'linear-gradient(135deg, #4318FF, #0075FF)'
                  : 'transparent',
                boxShadow: active ? '0 0 20px rgba(67, 24, 255, 0.4)' : 'none',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              <span className="transition-colors duration-200" style={{ color: active ? '#FFFFFF' : '#4318FF' }}>{item.icon}</span>
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-white/5 bg-navy/20">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_#01B574]" style={{ background: '#01B574' }} />
          <span className="text-[11px] font-bold" style={{ color: '#A0AEC0' }}>Live · Session Cached</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 z-40 transition-all duration-300"
        style={{
          background: 'rgba(11, 20, 55, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <NavContent />
      </aside>

      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg transition-transform active:scale-95"
        style={{ background: 'linear-gradient(135deg, #4318FF, #0075FF)' }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
          {mobileOpen
            ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            : <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside
            className="relative w-64 h-full flex flex-col z-50 shadow-2xl transition-all duration-300"
            style={{
              background: 'rgba(11, 20, 55, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}
