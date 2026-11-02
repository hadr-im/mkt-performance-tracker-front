'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Building2, GraduationCap, Boxes, Menu, X, Heart } from 'lucide-react';

const NAV = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/departments', label: 'Departments', icon: Building2 },
  { href: '/universities', label: 'Universities', icon: GraduationCap },
  { href: '/products', label: 'Products', icon: Boxes },
];

function NavContent({ pathname, onNavigate, inDrawer = false }) {
  return (
    <div className="flex h-full flex-col">
      {/* Matches the header's height so the two dividers form one line.
          In the drawer the close button overlaps this row, so the title
          is pushed clear of it. */}
      <div
        className={`flex h-[var(--header-h)] shrink-0 items-center border-b border-line pr-4 ${inDrawer ? 'pl-[3.75rem]' : 'pl-5'}`}
      >
        <p className="font-display text-[16px] font-extrabold leading-tight tracking-[0.02em] text-ink">
          SU Performance Tracker
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 p-2.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex min-h-[42px] items-center gap-2.5 rounded-md2 px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ease-out2
                ${active
                  ? 'bg-brand text-white shadow-e2'
                  : 'text-ink-2 hover:bg-surface-2 hover:text-ink'}`}
            >
              <Icon
                size={17}
                strokeWidth={2.1}
                className={active ? 'text-white' : 'text-ink-4 transition-colors group-hover:text-brand'}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-4 py-3.5">
        {/* Plain inline flow, not flex — flex made each word its own item,
            so the line broke after every one of them. */}
        <p className="text-center text-2xs font-semibold leading-snug text-ink-3">
          Made with{' '}
          <Heart
            size={11}
            strokeWidth={0}
            aria-label="love"
            className="inline-block translate-y-[1px] fill-brand"
          />{' '}
          by the{' '}
          <span className="whitespace-nowrap font-bold text-brand">IM department</span>
        </p>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-dvh w-[232px] flex-col border-r border-line bg-surface lg:flex">
        <NavContent pathname={pathname} />
      </aside>

      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="fixed left-3 top-2 z-[70] grid h-10 w-10 place-items-center rounded-md2 border border-line bg-surface text-ink shadow-e2 transition active:scale-95 lg:hidden"
      >
        {open ? <X size={18} strokeWidth={2.4} /> : <Menu size={18} strokeWidth={2.4} />}
      </button>

      {open && (
        // Above the sticky header (z-40), otherwise the header covers the
        // drawer's first nav items.
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Wider than the desktop rail so the title fits beside the
              close button; capped so the page stays visible behind it. */}
          <aside className="animate-pop absolute left-0 top-0 h-dvh w-[min(86vw,310px)] border-r border-line bg-surface shadow-e4">
            <NavContent pathname={pathname} onNavigate={() => setOpen(false)} inDrawer />
          </aside>
        </div>
      )}
    </>
  );
}
