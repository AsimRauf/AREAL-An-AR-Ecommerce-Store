import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiUser, FiMail, FiLock, FiBriefcase, FiPhone, FiMapPin } from 'react-icons/fi'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useSellerAuth } from '../../../utils/sellerAuth'

const signupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email is too short')
    .max(100, 'Email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  businessName: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name is too long'),
  businessAddress: z.string()
    .min(10, 'Please provide a complete business address')
    .max(200, 'Address is too long'),
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number'),
  storeDescription: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description is too long'),
  businessType: z.enum(['Individual', 'Company', 'Partnership']),
  category: z.enum(['Electronics', 'Fashion', 'Food', 'Home', 'Beauty', 'Other']),
  taxId: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
})

export default function SellerSignup() {
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const router = useRouter()
  const { getSession } = useSellerAuth()

  useEffect(() => {
    const session = getSession()
    if (session) {
      router.push('/seller/dashboard')
    }
  }, [])

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema)
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await fetch('/api/seller/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, image: imagePreview })
      })

      if (!response.ok) throw new Error('Registration failed')

      toast.success('Registration successful! Redirecting to login...')
      setTimeout(() => {
        window.location.href = '/seller/auth/signin'
      }, 2000)
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 px-4 py-6 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-4 sm:p-6 md:p-8 border border-white/20">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-6 sm:mb-8 md:mb-12 drop-shadow-lg">
            Create Your Seller Account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            {/* Profile Image Upload */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 group">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-indigo-400/50 shadow-xl bg-white/10 backdrop-blur-sm">
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500/50 to-purple-500/50 flex items-center justify-center">
                      <svg
                        className="w-8 sm:w-12 h-8 sm:h-12 text-white/70"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-gradient-to-r from-indigo-500 to-purple-500 p-2 sm:p-3 rounded-full cursor-pointer hover:scale-110 transition-transform duration-300 shadow-lg">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </label>
              </div>
            </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {/* Name and Email (single row) */}
                <div className="col-span-1">
                  <div className="relative group">
                    <FiUser className="absolute top-3 left-3 text-indigo-300 group-hover:text-indigo-200 transition-colors" />
                    <input
                      {...register('name')}
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-indigo-300/30 rounded-lg text-white placeholder-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm sm:text-base"
                    />
                    {errors.name && <p className="mt-1 text-red-400 text-xs sm:text-sm">{errors.name.message as string}</p>}
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="relative group">
                    <FiMail className="absolute top-3 left-3 text-indigo-300 group-hover:text-indigo-200" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="Email Address"
                      className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-indigo-300/30 rounded-lg text-white placeholder-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm sm:text-base"
                    />
                    {errors.email && <p className="mt-1 text-red-400 text-xs sm:text-sm">{errors.email.message as string}</p>}
                  </div>
                </div>

                {/* Password and Phone (single row) */}
                <div className="col-span-1">
                  <div className="relative group">
                    <FiLock className="absolute top-3 left-3 text-indigo-300 group-hover:text-indigo-200" />
                    <input
                      {...register('password')}
                      type="password"
                      placeholder="Password"
                      className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-indigo-300/30 rounded-lg text-white placeholder-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm sm:text-base"
                    />
                    {errors.password && <p className="mt-1 text-red-400 text-xs sm:text-sm">{errors.password.message as string}</p>}
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="relative group">
                    <FiPhone className="absolute top-3 left-3 text-indigo-300 group-hover:text-indigo-200" />
                    <input
                      {...register('phoneNumber')}
                      placeholder="Phone Number"
                      className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-indigo-300/30 rounded-lg text-white placeholder-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm sm:text-base"
                    />
                    {errors.phoneNumber && <p className="mt-1 text-red-400 text-xs sm:text-sm">{errors.phoneNumber.message as string}</p>}
                  </div>
                </div>

                {/* Business Name and Business Type (single row) */}
                <div className="col-span-1">
                  <div className="relative group">
                    <FiBriefcase className="absolute top-3 left-3 text-indigo-300 group-hover:text-indigo-200" />
                    <input
                      {...register('businessName')}
                      placeholder="Business Name"
                      className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-indigo-300/30 rounded-lg text-white placeholder-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm sm:text-base"
                    />
                    {errors.businessName && <p className="mt-1 text-red-400 text-xs sm:text-sm">{errors.businessName.message as string}</p>}
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="relative group">
                    <select
                      {...register('businessType')}
                      className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-indigo-300/30 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm sm:text-base"
                    >
                      <option value="" className="bg-gray-900">Select Business Type</option>
                      <option value="Individual" className="bg-gray-900">Individual</option>
                      <option value="Company" className="bg-gray-900">Company</option>
                      <option value="Partnership" className="bg-gray-900">Partnership</option>
                    </select>
                    {errors.businessType && <p className="mt-1 text-red-400 text-xs sm:text-sm">{errors.businessType.message as string}</p>}
                  </div>
                </div>

                {/* Business Address and Category (single row) */}
                <div className="col-span-1">
                  <div className="relative group">
                    <FiMapPin className="absolute top-3 left-3 text-indigo-300 group-hover:text-indigo-200" />
                    <input
                      {...register('businessAddress')}
                      placeholder="Business Address"
                      className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-indigo-300/30 rounded-lg text-white placeholder-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm sm:text-base"
                    />
                    {errors.businessAddress && <p className="mt-1 text-red-400 text-xs sm:text-sm">{errors.businessAddress.message as string}</p>}
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="relative group">
                    <select
                      {...register('category')}
                      className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-indigo-300/30 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm sm:text-base"
                    >
                      <option value="" className="bg-gray-900">Select Category</option>
                      <option value="Electronics" className="bg-gray-900">Electronics</option>
                      <option value="Fashion" className="bg-gray-900">Fashion</option>
                      <option value="Food" className="bg-gray-900">Food</option>
                      <option value="Home" className="bg-gray-900">Home</option>
                      <option value="Beauty" className="bg-gray-900">Beauty</option>
                      <option value="Other" className="bg-gray-900">Other</option>
                    </select>
                    {errors.category && <p className="mt-1 text-red-400 text-xs sm:text-sm">{errors.category.message as string}</p>}
                  </div>
                </div>

                {/* Store Description (full width) */}
                <div className="col-span-2">
                  <textarea
                    {...register('storeDescription')}
                    placeholder="Store Description"
                    rows={4}
                    className="w-full pl-4 pr-4 py-2 sm:py-3 bg-white/10 border border-indigo-300/30 rounded-lg text-white placeholder-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm sm:text-base"
                  />
                  {errors.storeDescription && <p className="mt-1 text-red-400 text-xs sm:text-sm">{errors.storeDescription.message as string}</p>}
                </div>

                {/* Terms checkbox (full width) */}
                <div className="col-span-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      {...register('acceptTerms')}
                      className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 rounded border-indigo-300/30 bg-white/10"
                    />
                    <span className="text-white text-sm sm:text-base">I accept the terms and conditions</span>
                  </label>
                  {errors.acceptTerms && <p className="mt-1 text-red-400 text-xs sm:text-sm">{errors.acceptTerms.message as string}</p>}
                </div>

                {/* Submit button (full width) */}
                <div className="col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 sm:py-4 px-6 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
                  >
                    {loading ? 'Creating Account...' : 'Create Seller Account'}
                  </button>
                </div>
              </div>
            </form>

          <p className="text-center text-indigo-300 mt-6 sm:mt-8 text-sm sm:text-base">
            Already have a seller account?{' '}
            <Link href="/seller/auth/signin" className="text-indigo-400 hover:text-white transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

