'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, User } from 'lucide-react'
import { userAPI } from '@/lib/api'
import { getInitials } from '@/lib/utils'

interface ProfilePictureProps {
  userId: string
  currentPhotoUrl?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  editable?: boolean
  onPhotoUpdate?: (photoUrl: string) => void
}

export default function ProfilePicture({
  userId,
  currentPhotoUrl,
  name,
  size = 'md',
  editable = false,
  onPhotoUpdate
}: ProfilePictureProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-lg',
    xl: 'w-32 h-32 text-2xl'
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setError('')
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const response = await userAPI.uploadProfilePhoto(file)
      const photoUrl = response.data.photo_url
      
      setPreviewUrl(null)
      if (onPhotoUpdate) {
        onPhotoUpdate(photoUrl)
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload photo')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setPreviewUrl(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayUrl = previewUrl || currentPhotoUrl

  return (
    <div className="relative">
      {/* Profile Picture Display */}
      <div className="relative">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={`${name}'s profile`}
            className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
          />
        ) : (
          <div className={`${sizeClasses[size]} rounded-full bg-blue-100 border-2 border-gray-200 flex items-center justify-center text-blue-600 font-medium`}>
            {getInitials(name)}
          </div>
        )}

        {/* Upload Button Overlay */}
        {editable && !previewUrl && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition-colors shadow-lg"
            title="Upload photo"
          >
            <Camera className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Preview Photo</h3>
            
            <div className="flex justify-center mb-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="btn btn-primary flex-1"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-outline flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 