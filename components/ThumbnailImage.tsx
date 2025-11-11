'use client'

import { useState } from 'react'

interface ThumbnailImageProps {
  src: string
  alt: string
  className?: string
  height?: string
  containerClassName?: string
}

export default function ThumbnailImage({ 
  src, 
  alt, 
  className = '', 
  height = 'h-48',
  containerClassName = ''
}: ThumbnailImageProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError || !src || src.trim() === '') {
    return null
  }

  return (
    <div className={`mb-4 rounded-lg overflow-hidden bg-gray-100 ${containerClassName}`}>
      <img 
        src={src} 
        alt={alt}
        className={`w-full ${height} object-cover transition-transform duration-300 hover:scale-105 ${className}`}
        loading="lazy"
        onError={() => {
          setHasError(true)
        }}
      />
    </div>
  )
}

