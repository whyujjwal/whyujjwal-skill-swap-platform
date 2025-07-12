'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { skillAPI } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category required'),
  level: z.string().min(1, 'Level required'),
  type: z.enum(['offer', 'request']),
})

type SkillForm = z.infer<typeof skillSchema>

const CATEGORIES = [
  'Programming',
  'Design',
  'Language',
  'Music',
  'Cooking',
  'Fitness',
  'Business',
  'Art',
  'Technology',
  'Other'
]

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

export default function NewSkillPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SkillForm>({
    resolver: zodResolver(skillSchema),
  })

  const onSubmit = async (data: SkillForm) => {
    setLoading(true)
    setError('')
    
    try {
      await skillAPI.create(data)
      router.push('/dashboard')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || 'Failed to create skill')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="btn btn-outline text-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Add New Skill</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className="input"
                  placeholder="e.g., Python Programming"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={4}
                  className="input resize-none"
                  placeholder="Describe what you can teach or what you want to learn..."
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    {...register('category')}
                    id="category"
                    className="input"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    {...register('level')}
                    id="level"
                    className="input"
                  >
                    <option value="">Select level</option>
                    {LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  {errors.level && (
                    <p className="text-red-600 text-sm mt-1">{errors.level.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      {...register('type')}
                      type="radio"
                      value="offer"
                      className="mr-2"
                    />
                    <span className="text-sm">I can teach this</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      {...register('type')}
                      type="radio"
                      value="request"
                      className="mr-2"
                    />
                    <span className="text-sm">I want to learn this</span>
                  </label>
                </div>
                {errors.type && (
                  <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? 'Creating...' : 'Create Skill'}
                </button>
                <Link href="/dashboard" className="btn btn-outline flex-1">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 