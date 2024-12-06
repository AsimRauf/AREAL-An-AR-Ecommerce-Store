import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSellerAuth } from '../../utils/sellerAuth'

export default function ProtectedSellerRoute({ children }) {
  const router = useRouter()
  const { getSession } = useSellerAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (session) {
      setIsAuthenticated(true)
    } else {
      router.push('/seller/auth/signin')
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return isAuthenticated ? children : null
}