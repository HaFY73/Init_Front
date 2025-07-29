"use client"

import React from 'react'
import { getImageUrl } from '@/utils/imageUtils'

interface ImageDebuggerProps {
  src?: string
  alt?: string
  className?: string
}

export const ImageDebugger: React.FC<ImageDebuggerProps> = ({ 
  src, 
  alt = "debug image", 
  className = "" 
}) => {
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading')
  const [processedUrl, setProcessedUrl] = React.useState<string>('')
  
  React.useEffect(() => {
    if (!src) {
      setStatus('error')
      setProcessedUrl('')
      return
    }

    const url = getImageUrl(src)
    setProcessedUrl(url)
    setStatus('loading')
    
    const img = new Image()
    img.onload = () => {
      console.log('✅ 이미지 로딩 성공:', url)
      setStatus('success')
    }
    img.onerror = () => {
      console.error('❌ 이미지 로딩 실패:', url)
      setStatus('error')
    }
    img.src = url
  }, [src])

  if (process.env.NODE_ENV !== 'development') {
    return null // 개발 환경에서만 표시
  }

  return (
    <div className={`p-2 border rounded text-xs ${className}`}>
      <p><strong>원본 URL:</strong> {src || 'undefined'}</p>
      <p><strong>처리된 URL:</strong> {processedUrl || 'undefined'}</p>
      <p><strong>상태:</strong> 
        <span className={`ml-1 px-1 rounded ${
          status === 'success' ? 'bg-green-100 text-green-700' :
          status === 'error' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {status}
        </span>
      </p>
      {status === 'success' && processedUrl && (
        <img 
          src={processedUrl} 
          alt={alt} 
          className="w-16 h-16 rounded object-cover mt-1" 
        />
      )}
      {status === 'error' && (
        <div className="w-16 h-16 bg-red-100 flex items-center justify-center text-red-500 text-xs mt-1 rounded">
          실패
        </div>
      )}
    </div>
  )
}

export default ImageDebugger