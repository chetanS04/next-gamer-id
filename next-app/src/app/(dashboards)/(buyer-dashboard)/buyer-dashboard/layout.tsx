'use client'

import { useState } from 'react'
import Sidebar from '@/components/(dashboards)/BuyerSidebar'
import ProtectedRoute from '@/components/(sheared)/ProtectedRoute'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <ProtectedRoute role='Buyer'>    

    <div className="flex">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main content */}
      <main
        className="flex-1 pt-[30px] px-5 bg-gray-50 transition-all duration-300 min-h-screen"
        style={{
          marginLeft: isOpen ? 256 : 64, // match sidebar widths (16rem / 4rem)
        }}
      >
        {children}
      </main>
    </div>
    </ProtectedRoute>
  )
}
