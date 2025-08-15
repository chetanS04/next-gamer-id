'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  role?: string
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login')
      } else if (role && user.role !== role) {
        router.replace('/unauthorize')
      }
    }
  }, [user, loading, role, router])

  if (loading || !user || (role && user.role !== role)) {
    return <div className="fixed inset-0 bg-gray-100/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  return <>{children}</>
}

export default ProtectedRoute
