'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { swapAPI, skillAPI } from '@/lib/api'
import { Skill, User, TimeSlot } from '@/lib/api'
import { ArrowLeft, Plus, X } from 'lucide-react'

const swapSchema = z.object({
  receiver_id: z.string().min(1, 'Please select a user'),
  receiver_skill_id: z.string().min(1, 'Please select a skill'),
})

type SwapForm = z.infer<typeof swapSchema>

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function NewSwapPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState<Skill[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [availability, setAvailability] = useState<TimeSlot[]>([])
  const [showTimeForm, setShowTimeForm] = useState(false)
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
    watch,
  } = useForm<SwapForm>({
    resolver: zodResolver(swapSchema),
  })

  const watchedReceiverId = watch('receiver_id')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsRes = await skillAPI.getAll()
        setSkills(skillsRes.data)
        // For demo, we'll use a mock user list
        setUsers([
          { id: '1', name: 'Alice', email: 'alice@example.com' },
          { id: '2', name: 'Bob', email: 'bob@example.com' },
          { id: '3', name: 'Charlie', email: 'charlie@example.com' },
        ])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (watchedReceiverId) {
      const user = users.find(u => u.id === watchedReceiverId)
      setSelectedUser(user || null)
    }
  }, [watchedReceiverId, users])

  const addTimeSlot = () => {
    if (newTimeSlot.start < newTimeSlot.end) {
      setAvailability([...availability, newTimeSlot])
      setNewTimeSlot({ day: 'Monday', start: '09:00', end: '10:00' })
      setShowTimeForm(false)
    }
  }

  const removeTimeSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: SwapForm) => {
    if (availability.length === 0) {
      setError('Please add at least one time slot')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await swapAPI.create({
        requester_skill_id: 'mock-skill-id', // In real app, get from user's skills
        receiver_id: data.receiver_id,
        receiver_skill_id: data.receiver_skill_id,
        proposed_time_slots: availability,
      })
      router.push('/dashboard')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || 'Failed to create swap')
    } finally {
      setLoading(false)
    }
  }

  const userSkills = skills.filter(skill => 
    selectedUser && skill.id === watchedReceiverId
  )

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
            <h1 className="text-2xl font-bold text-gray-900">Create Swap</h1>
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
                <label htmlFor="receiver_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  {...register('receiver_id')}
                  id="receiver_id"
                  className="input"
                >
                  <option value="">Choose a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
                {errors.receiver_id && (
                  <p className="text-red-600 text-sm mt-1">{errors.receiver_id.message}</p>
                )}
              </div>

              {selectedUser && (
                <div>
                  <label htmlFor="receiver_skill_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Skill from {selectedUser.name}
                  </label>
                  <select
                    {...register('receiver_skill_id')}
                    id="receiver_skill_id"
                    className="input"
                  >
                    <option value="">Choose a skill</option>
                    {userSkills.map(skill => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name} - {skill.level} ({skill.type})
                      </option>
                    ))}
                  </select>
                  {errors.receiver_skill_id && (
                    <p className="text-red-600 text-sm mt-1">{errors.receiver_skill_id.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposed Time Slots
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
                  {!showTimeForm && (
                    <button
                      type="button"
                      onClick={() => setShowTimeForm(true)}
                      className="btn btn-outline w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add time slot
                    </button>
                  )}
                  {showTimeForm && (
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
                          onClick={() => setShowTimeForm(false)}
                          className="btn btn-outline flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? 'Creating...' : 'Create Swap'}
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