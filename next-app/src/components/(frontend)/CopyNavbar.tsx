'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  // const dropdownRef = useRef<HTMLDivElement>(null);

  const dropdownRef = useRef<HTMLLIElement>(null);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleDashboardRedirect = () => {
    switch (user?.role) {
      case 'Admin':
        router.push('/dashboard');
        break;
      case 'Buyer':
        router.push('/buyer-dashboard');
        break;
      case 'Seller':
        router.push('/seller-dashboard');
        break;
      default:
        router.push('/login');
        break;
    }
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-gray-200 rounded-full max-w-7xl mx-auto px-8 my-4 py-3 flex items-center justify-between shadow-md select-none relative z-50">
      {/* Logo */}
      <div className="text-2xl font-bold tracking-tight text-gray-800">
        <Link href="/" className="px-3">Gaming</Link>
      </div>

      {/* Desktop nav */}
      <ul className="hidden md:flex items-center space-x-8">
        <li>
          <Link href="/contact-us" className="text-gray-700 hover:text-gray-900 text-sm font-semibold">
            Contact Us
          </Link>
        </li>
        <li>
          <Link href="/about" className="text-gray-700 hover:text-gray-900 text-sm font-semibold">
            About
          </Link>
        </li>

        {user ? (
          <li className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm font-semibold"
              title={user.name}
            >
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 flex flex-col bg-white border border-gray-200 shadow-lg rounded-md py-2 w-44 z-50">
                <button
                  onClick={handleDashboardRedirect}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                >
                  Dashboard
                </button>
                <div className="px-4 py-2 text-xs text-gray-500 italic">
                  Role: {user?.role}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-left w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </li>
        ) : (
          <li className="flex items-center space-x-4">
            <Link
              href="/login"
              className="rounded-full border border-gray-300 bg-white px-4 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Register
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
