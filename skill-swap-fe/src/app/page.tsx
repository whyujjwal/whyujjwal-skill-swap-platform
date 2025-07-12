'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { ArrowRight, Users, BookOpen, MessageSquare, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const { isAdmin } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Skill Swap</h1>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn btn-outline">
              Login
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Join Free
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
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Exchange Skills,
            <br />
            <span className="text-blue-600">Build Community</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with like-minded people, teach what you know, and learn what you need. 
            Join a community where knowledge flows freely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup" className="btn btn-primary text-lg px-8 py-4 shadow-lg">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/login" className="btn btn-outline text-lg px-8 py-4">
              Sign In
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mb-16">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Safe & secure</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Community driven</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Connect</h3>
            <p className="text-gray-600 leading-relaxed">
              Find skilled people in your area or online. Build meaningful connections through shared learning.
            </p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Learn</h3>
            <p className="text-gray-600 leading-relaxed">
              Master new skills from experts. Get personalized guidance and hands-on experience.
            </p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Share</h3>
            <p className="text-gray-600 leading-relaxed">
              Share your expertise and help others grow. Build your reputation in the community.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to start swapping?</h2>
            <p className="text-gray-600 mb-6">
              Join thousands of learners and teachers already sharing knowledge.
            </p>
            <Link href="/signup" className="btn btn-primary text-lg px-8 py-4 shadow-lg">
              Create Your Account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Skill Swap. Built with ❤️ for the community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 