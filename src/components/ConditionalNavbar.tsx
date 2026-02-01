'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't show navbar on admin routes, sign-in, or sign-up pages
  if (pathname?.startsWith('/admin') || pathname === '/sign-in' || pathname === '/sign-up') {
    return null;
  }

  return <Navbar />;
}
