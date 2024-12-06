import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiMail, FiLock } from 'react-icons/fi'
import Link from 'next/link'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useSellerAuth } from '../../../utils/sellerAuth'

const signinSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

interface SigninFormData {
  email: string
  password: string
}

export default function SellerSignin() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { getSession } = useSellerAuth()

  useEffect(() => {
    const session = getSession()
    if (session) {
      router.push('/seller/dashboard')
    }
  }, [])

  const { register, handleSubmit, formState: { errors } } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema)
  })

  const onSubmit: SubmitHandler<SigninFormData> = async (data) => {
    setLoading(true)
    try {
      const response = await fetch('/api/seller/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      
      if (response.ok) {
        localStorage.setItem('seller-session', JSON.stringify({
          token: result.token,
          seller: result.seller,
          expiresAt: result.expiresAt
        }))
        router.push('/seller/dashboard')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 border border-white/20">
        <h1 className="text-3xl font-bold text-center text-white mb-8 drop-shadow-lg">
          Seller Login
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative group">
            <FiMail className="absolute top-3 left-3 text-indigo-300 group-hover:text-indigo-200" />
            <input
              {...register('email')}
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-indigo-300/30 rounded-lg text-white placeholder-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
            {errors.email && (
              <p className="mt-1 text-red-400 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="relative group">
            <FiLock className="absolute top-3 left-3 text-indigo-300 group-hover:text-indigo-200" />
            <input
              {...register('password')}
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-indigo-300/30 rounded-lg text-white placeholder-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
            {errors.password && (
              <p className="mt-1 text-red-400 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <Link 
            href="/seller/auth/forgot-password"
            className="text-indigo-300 hover:text-white transition-colors"
          >
            Forgot password?
          </Link>
          
          <p className="text-indigo-300">
            Don't have a seller account?{' '}
            <Link 
              href="/seller/auth/signup"
              className="text-indigo-400 hover:text-white transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
