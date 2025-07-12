'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authAPI } from '@/lib/api'
import { Eye, EyeOff, ArrowLeft, Plus, X } from 'lucide-react'

const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name required'),
  location: z.string().optional(),
  bio: z.string().optional(),
  is_public: z.boolean(),
})

type SignupForm = z.infer<typeof signupSchema>

interface TimeSlot {
  day: string
  start: string
  end: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [availability, setAvailability] = useState<TimeSlot[]>([])
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false)
  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>({
    day: 'Monday',
    start: '09:00',
    end: '10:00',
  })
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      is_public: true,
    },
  })

  const addTimeSlot = () => {
    if (newTimeSlot.start < newTimeSlot.end) {
      setAvailability([...availability, newTimeSlot])
      setNewTimeSlot({ day: 'Monday', start: '09:00', end: '10:00' })
      setShowAvailabilityForm(false)
    }
  }

  const removeTimeSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: SignupForm) => {
    setLoading(true)
    setError('')
    
    try {
      await authAPI.signup({
        ...data,
        availability: availability.length > 0 ? availability : undefined,
      })
      router.push('/verify-email?email=' + encodeURIComponent(data.email))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="card p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Join Skill Swap</h1>
            <p className="text-gray-600 mt-2">Create your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="input"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="input"
                placeholder="Enter your name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                {...register('location')}
                type="text"
                id="location"
                className="input"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                {...register('bio')}
                id="bio"
                rows={3}
                className="input resize-none"
                placeholder="Tell us about yourself"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  {...register('is_public')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Make profile public</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <div className="space-y-2">
                {availability.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm">{slot.day} {slot.start}-{slot.end}</span>
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {!showAvailabilityForm && (
                  <button
                    type="button"
                    onClick={() => setShowAvailabilityForm(true)}
                    className="btn btn-outline w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add time slot
                  </button>
                )}
                {showAvailabilityForm && (
                  <div className="space-y-2 p-3 border rounded">
                    <select
                      value={newTimeSlot.day}
                      onChange={(e) => setNewTimeSlot({ ...newTimeSlot, day: e.target.value })}
                      className="input"
                    >
                      {DAYS.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={newTimeSlot.start}
                        onChange={(e) => setNewTimeSlot({ ...newTimeSlot, start: e.target.value })}
                        className="input"
                      />
                      <input
                        type="time"
                        value={newTimeSlot.end}
                        onChange={(e) => setNewTimeSlot({ ...newTimeSlot, end: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addTimeSlot}
                        className="btn btn-primary flex-1"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAvailabilityForm(false)}
                        className="btn btn-outline flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 