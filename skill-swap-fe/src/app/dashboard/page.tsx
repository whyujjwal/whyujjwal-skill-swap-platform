'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { userAPI, skillAPI, swapAPI } from '@/lib/api'
import { User, Skill, Swap } from '@/lib/api'
import { 
  User as UserIcon, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  LogOut,
  Plus,
  Search,
  Filter
} from 'lucide-react'

export default function DashboardPage() {
  const { logout, isAdmin } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [swaps, setSwaps] = useState<Swap[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        const [userRes, skillsRes, swapsRes] = await Promise.all([
          userAPI.getProfile(),
          skillAPI.getAll(),
          swapAPI.getAll(),
        ])
        
        setUser(userRes.data)
        setSkills(skillsRes.data)
        setSwaps(swapsRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Skill Swap</h1>
              {isAdmin && (
                <Link href="/admin" className="btn btn-secondary text-sm">
                  Admin Panel
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline text-sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <UserIcon className="h-5 w-5" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'skills'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="h-5 w-5" />
                Skills
              </button>
              <button
                onClick={() => setActiveTab('swaps')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'swaps'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="h-5 w-5" />
                Swaps
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-5 w-5" />
                Profile
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="card p-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">My Skills</p>
                        <p className="text-2xl font-bold">{skills.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="card p-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Active Swaps</p>
                        <p className="text-2xl font-bold">
                          {swaps.filter(s => s.status === 'accepted').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="card p-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <UserIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Profile Views</p>
                        <p className="text-2xl font-bold">-</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                  {swaps.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No recent activity</p>
                  ) : (
                    <div className="space-y-3">
                      {swaps.slice(0, 5).map((swap) => (
                        <div key={swap.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">Swap #{swap.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-600">{swap.status}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            swap.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            swap.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {swap.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My Skills</h2>
                  <Link href="/skills/new" className="btn btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {skills.map((skill) => (
                    <div key={skill.id} className="card p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{skill.name}</h3>
                          <p className="text-sm text-gray-600">{skill.category}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          skill.status === 'approved' ? 'bg-green-100 text-green-700' :
                          skill.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {skill.status}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{skill.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{skill.level}</span>
                        <span className="text-sm text-gray-600 capitalize">{skill.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'swaps' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My Swaps</h2>
                  <Link href="/swaps/new" className="btn btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    New Swap
                  </Link>
                </div>

                <div className="space-y-4">
                  {swaps.map((swap) => (
                    <div key={swap.id} className="card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Swap #{swap.id.slice(0, 8)}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          swap.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          swap.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          swap.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {swap.status}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Requester</p>
                          <p className="font-medium">{swap.requester}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Receiver</p>
                          <p className="font-medium">{swap.receiver}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Profile Settings</h2>
                <div className="card p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        className="input"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="input"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={user?.location || ''}
                        className="input"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={user?.bio || ''}
                        rows={3}
                        className="input resize-none"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link href="/profile/edit" className="btn btn-primary">
                      Edit Profile
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 