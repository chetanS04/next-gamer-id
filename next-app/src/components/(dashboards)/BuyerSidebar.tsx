'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Menu } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/buyer-dashboard/games-purchased', label: 'Games Purchased', icon: Home },
]

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const modalRef = useRef<HTMLDivElement>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsOpen(false)
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowUserModal(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [setIsOpen])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const getActiveLink = () => {
    return navLinks.reduce((prev, curr) => {
      return pathname.startsWith(curr.href) && curr.href.length > prev.href.length ? curr : prev
    }, navLinks[0])
  }

  const activeLink = getActiveLink()

  return (
    <aside
      className={`h-screen transition-all duration-300 ease-in-out border-r border-gray-300 ${
        isOpen ? 'w-64' : 'w-16'
      } bg-gray-200 text-gray-800 fixed top-0 left-0 z-40 shadow-md flex flex-col justify-between`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-300">
        <span className="text-xl font-bold">{isOpen ? 'ArrayLog' : ''}</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="mt-4 flex-1 overflow-y-auto">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = activeLink.href === href
          return (
            <Link href={href} key={href}>
              <div
                className={`flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-colors ${
                  isActive ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:bg-white hover:text-black'
                }`}
              >
                <Icon className="w-5 h-5" />
                {isOpen && <span className="ml-3 text-sm font-medium">{label}</span>}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User Icon at Bottom */}
      <div className="relative px-4 py-3 border-t border-gray-300">
        <div
          onClick={() => setShowUserModal((prev) => !prev)}
          className="flex items-center cursor-pointer hover:bg-gray-300 p-2 rounded-md"
        >
          <div className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {isOpen && (
            <span className="ml-3 text-sm text-gray-700 font-medium">{user?.name || 'User'}</span>
          )}
        </div>

        {/* Dropdown Modal */}
        {showUserModal && (
          <div
            ref={modalRef}
            className="absolute bottom-14 left-2 bg-white border border-gray-300 shadow-xl rounded-md w-48 z-50 overflow-hidden"
          >
            <Link href="/" className="block px-4 py-2 text-sm hover:bg-gray-100">
              Home
            </Link>
            <Link href="/settings" className="block px-4 py-2 text-sm hover:bg-gray-100">
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
