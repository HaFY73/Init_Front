"use client"

import React from 'react'
import { ProfileDialogProvider, useProfileDialog } from '@/contexts/ProfileDialogContext'
import { ProfileDialog } from '@/components/profile-dialog'

// 프로필 다이얼로그를 포함한 레이아웃 예시
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen } = useProfileDialog()

  return (
    <div>
      {children}
      <ProfileDialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  )
}

// 메인 레이아웃 컴포넌트
export function LayoutWithProfile({ children }: { children: React.ReactNode }) {
  return (
    <ProfileDialogProvider>
      <LayoutContent>
        {children}
      </LayoutContent>
    </ProfileDialogProvider>
  )
}
