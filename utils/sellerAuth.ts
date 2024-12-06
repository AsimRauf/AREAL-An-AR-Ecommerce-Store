import { useEffect } from 'react'
import { useRouter } from 'next/router'
import jwt from 'jsonwebtoken'

export interface SellerSession {
  token: string
  seller: {
    id: string
    name: string
    email: string
    businessName: string
    profileImage?: string
  }
  expiresAt: number
}

export function useSellerAuth() {
  const router = useRouter()

  const getSession = (): SellerSession | null => {
    if (typeof window === 'undefined') return null
    
    const session = localStorage.getItem('seller-session')
    if (!session) return null
    
    const parsedSession = JSON.parse(session)
    if (Date.now() > parsedSession.expiresAt) {
      localStorage.removeItem('seller-session')
      return null
    }
    
    return parsedSession
  }

  const logout = () => {
    localStorage.removeItem('seller-session')
    router.push('/seller/auth/signin')
  }

  return { getSession, logout }
}
export const verifySellerToken = (req) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) throw new Error('No token provided')

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sellerId: string }
    return decoded.sellerId
  } catch (error) {
    throw new Error('Invalid token')
  }
}
