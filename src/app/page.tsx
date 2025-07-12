'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { ArrowRight, Users, BookOpen, MessageSquare } from 'lucide-react'

export default function HomePage() {
  const { isAdmin } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Skill Swap</h1>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn btn-outline">
              Login
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Join
            </Link>
            {isAdmin && (
              <Link href="/admin" className="btn btn-secondary">
                Admin
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Exchange Skills
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Teach what you know, learn what you need
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn btn-primary text-lg px-8 py-3">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/login" className="btn btn-outline text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect</h3>
            <p className="text-gray-600">Find people with skills you need</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Learn</h3>
            <p className="text-gray-600">Exchange knowledge and grow</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Share</h3>
            <p className="text-gray-600">Teach others what you know</p>
          </div>
        </div>
      </main>
    </div>
  )
} 