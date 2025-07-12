'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { adminAPI } from '@/lib/api'
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  LogOut,
  ArrowLeft,
  Ban,
  Check,
  X,
  Send
} from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  name: string
  is_banned: boolean
  role: string
}

interface PendingSkill {
  id: string
  name: string
  status: string
}

export default function AdminPage() {
  const { logout, isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [pendingSkills, setPendingSkills] = useState<PendingSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [sendingBroadcast, setSendingBroadcast] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    if (!isAdmin) {
      router.push('/dashboard')
      return
    }

    const fetchData = async () => {
      try {
        const [usersRes, skillsRes] = await Promise.all([
          adminAPI.getUsers(),
          adminAPI.getPendingSkills(),
        ])
        
        setUsers(usersRes.data)
        setPendingSkills(skillsRes.data)
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, isAdmin])

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      await adminAPI.banUser(userId, { is_banned: isBanned })
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_banned: isBanned } : user
      ))
    } catch (error) {
      console.error('Error banning user:', error)
    }
  }

  const handleApproveSkill = async (skillId: string) => {
    try {
      await adminAPI.approveSkill(skillId)
      setPendingSkills(pendingSkills.filter(skill => skill.id !== skillId))
    } catch (error) {
      console.error('Error approving skill:', error)
    }
  }

  const handleRejectSkill = async (skillId: string) => {
    try {
      await adminAPI.rejectSkill(skillId, { reason: 'Inappropriate content' })
      setPendingSkills(pendingSkills.filter(skill => skill.id !== skillId))
    } catch (error) {
      console.error('Error rejecting skill:', error)
    }
  }

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return
    
    setSendingBroadcast(true)
    try {
      await adminAPI.broadcastMessage({ message: broadcastMessage })
      setBroadcastMessage('')
      alert('Broadcast sent successfully!')
    } catch (error) {
      console.error('Error sending broadcast:', error)
      alert('Failed to send broadcast')
    } finally {
      setSendingBroadcast(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
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
              <Link href="/dashboard" className="btn btn-outline text-sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <button onClick={handleLogout} className="btn btn-outline text-sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
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
                <Settings className="h-5 w-5" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'users'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="h-5 w-5" />
                Users
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
                onClick={() => setActiveTab('broadcast')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'broadcast'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="h-5 w-5" />
                Broadcast
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
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold">{users.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="card p-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <BookOpen className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pending Skills</p>
                        <p className="text-2xl font-bold">{pendingSkills.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="card p-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-3 rounded-lg">
                        <Ban className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Banned Users</p>
                        <p className="text-2xl font-bold">
                          {users.filter(u => u.is_banned).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {pendingSkills.slice(0, 3).map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{skill.name}</p>
                          <p className="text-sm text-gray-600">Pending approval</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">User Management</h2>
                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900 capitalize">{user.role}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.is_banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {user.is_banned ? 'Banned' : 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.is_banned ? (
                                <button
                                  onClick={() => handleBanUser(user.id, false)}
                                  className="btn btn-outline text-xs"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Unban
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBanUser(user.id, true)}
                                  className="btn btn-outline text-xs text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Ban className="h-3 w-3 mr-1" />
                                  Ban
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Skill Moderation</h2>
                <div className="space-y-4">
                  {pendingSkills.length === 0 ? (
                    <div className="card p-8 text-center">
                      <p className="text-gray-500">No pending skills to review</p>
                    </div>
                  ) : (
                    pendingSkills.map((skill) => (
                      <div key={skill.id} className="card p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{skill.name}</h3>
                            <p className="text-sm text-gray-600">ID: {skill.id}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveSkill(skill.id)}
                              className="btn btn-primary text-sm"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectSkill(skill.id)}
                              className="btn btn-outline text-sm text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'broadcast' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Send Broadcast</h2>
                <div className="card p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        rows={4}
                        className="input resize-none"
                        placeholder="Enter your broadcast message..."
                      />
                    </div>
                    <button
                      onClick={handleBroadcast}
                      disabled={sendingBroadcast || !broadcastMessage.trim()}
                      className="btn btn-primary"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendingBroadcast ? 'Sending...' : 'Send Broadcast'}
                    </button>
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