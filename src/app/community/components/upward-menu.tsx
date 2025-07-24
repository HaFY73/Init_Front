"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MessageSquare, BookmarkIcon, PenSquare, Menu, UserPlus, type LucideIcon } from "lucide-react"
import { useProfileDialog } from "@/contexts/ProfileDialogContext"
import { useCommunityProfile } from "@/hooks/useCommunityProfile"

interface UpwardMenuProps {
  className?: string
  onFollowClick: () => void
  onMyPostsClick: () => void
  onMyCommentsClick: () => void
  onSavedClick: () => void
}

interface MenuItem {
  icon: LucideIcon | typeof Avatar
  label: string
  color: string
  onClick: () => void
  isAvatar?: boolean
  disabled?: boolean // 🔥 비활성화 상태 추가
}

export function UpwardMenu({
                             className,
                             onFollowClick,
                             onMyPostsClick,
                             onMyCommentsClick,
                             onSavedClick,
                           }: UpwardMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { setIsOpen } = useProfileDialog()

  // 🔥 커뮤니티 프로필 정보 가져오기
  const { profile, loading, hasProfile, refetch } = useCommunityProfile()

  // 🔥 프로필 업데이트 이벤트 리스너
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('프로필 업데이트 이벤트 수신, 다시 로드합니다.')
      refetch()
    }

    window.addEventListener('profileUpdated', handleProfileUpdate)
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate)
  }, [refetch])

  // 🔥 프로필 없음 알림 함수
  const showProfileRequiredAlert = () => {
    alert('커뮤니티 프로필이 필요합니다. 프로필을 먼저 생성해주세요!')
    setIsOpen(true) // 프로필 다이얼로그 열기
  }

  // 🔥 메뉴 버튼 배열 - 프로필 존재 여부에 따라 비활성화
  const menuItems: MenuItem[] = [
    {
      icon: Avatar,
      label: hasProfile ? "프로필 수정" : "프로필 생성",
      color: hasProfile ? "bg-indigo-500 hover:bg-indigo-600" : "bg-green-500 hover:bg-green-600",
      onClick: () => setIsOpen(true),
      isAvatar: true,
    },
    {
      icon: Users,
      label: "팔로우",
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: hasProfile ? onFollowClick : showProfileRequiredAlert,
      disabled: !hasProfile
    },
    {
      icon: PenSquare,
      label: "작성한 글",
      color: "bg-green-500 hover:bg-green-600",
      onClick: hasProfile ? onMyPostsClick : showProfileRequiredAlert,
      disabled: !hasProfile
    },
    {
      icon: MessageSquare,
      label: "댓글단 글",
      color: "bg-yellow-500 hover:bg-yellow-600",
      onClick: hasProfile ? onMyCommentsClick : showProfileRequiredAlert,
      disabled: !hasProfile
    },
    {
      icon: BookmarkIcon,
      label: "저장한 글",
      color: "bg-orange-500 hover:bg-orange-600",
      onClick: hasProfile ? onSavedClick : showProfileRequiredAlert,
      disabled: !hasProfile
    },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuVisible(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMenuItemClick = (callback: () => void) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    callback()
    setMenuVisible(false)
  }

  const handleMainButtonClick = () => setMenuVisible(!menuVisible)

  // 프로필 이미지 URL 결정
  const getProfileImageUrl = () => {
    if (loading) return "/placeholder.svg?height=32&width=32"

    if (profile?.profileImageUrl) {
      if (profile.profileImageUrl.startsWith('data:')) {
        return profile.profileImageUrl
      }
      if (profile.profileImageUrl.startsWith('http')) {
        return profile.profileImageUrl
      }
      if (profile.profileImageUrl.startsWith('/')) {
        return `http://localhost:8080${profile.profileImageUrl}`
      }
      return profile.profileImageUrl
    }

    return "/placeholder.svg?height=32&width=32"
  }

  // 프로필 이름 첫 글자 가져오기
  const getProfileInitial = () => {
    if (loading) return "U"
    if (!hasProfile) return "+" // 🔥 프로필 없으면 + 표시
    return profile?.displayName?.charAt(0) || "U"
  }

  return (
      <div className={`fixed bottom-20 z-50 ${className ?? "right-6"}`} ref={menuRef}>
        <div className="flex flex-col-reverse items-center gap-3 mb-4">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon
            const isDisabled = item.disabled && !hasProfile

            return (
                <Button
                    key={index}
                    onClick={handleMenuItemClick(item.onClick)}
                    className={`rounded-full w-12 h-12 shadow-lg ${
                        isDisabled ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : item.color
                    } text-white flex items-center justify-center transition-all`}
                    style={{
                      opacity: menuVisible ? 1 : 0,
                      transform: menuVisible ? "translateY(0)" : "translateY(20px)",
                      pointerEvents: menuVisible ? "auto" : "none",
                      transition: `transform 0.3s ease, opacity 0.3s ease`,
                      transitionDelay: `${index * 50}ms`,
                    }}
                    title={isDisabled ? `${item.label} (프로필 필요)` : item.label}
                    size="icon"
                    disabled={isDisabled}
                >
                  {item.isAvatar ? (
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                              src={getProfileImageUrl()}
                              alt={profile?.displayName || "프로필"}
                              onError={(e) => {
                                console.log("이미지 로딩 실패:", getProfileImageUrl())
                                e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                              }}
                          />
                          <AvatarFallback className="text-xs font-medium">
                            {getProfileInitial()}
                          </AvatarFallback>
                        </Avatar>
                        {/* 🔥 프로필이 없으면 + 아이콘 오버레이 */}
                        {!hasProfile && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-500 rounded-full">
                              <UserPlus className="h-4 w-4 text-white" />
                            </div>
                        )}
                      </div>
                  ) : (
                      <IconComponent className="h-5 w-5" />
                  )}
                </Button>
            )
          })}
        </div>

        {/* 🔥 메인 버튼에 프로필 상태 표시 */}
        <Button
            className={`rounded-full w-14 h-14 shadow-lg ${
                hasProfile ? 'bg-[#6366f1] hover:bg-[#6366f1]/90' : 'bg-amber-500 hover:bg-amber-600'
            } text-white flex items-center justify-center relative`}
            onClick={handleMainButtonClick}
            size="icon"
        >
          <Menu className="h-6 w-6" />
          {/* 🔥 프로필 없으면 알림 점 표시 */}
          {!hasProfile && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">!</span>
              </div>
          )}
        </Button>
      </div>
  )
}