import { useState, useEffect } from 'react'
import { getCurrentUserId } from '@/utils/auth'

interface CommunityProfile {
    id?: number
    displayName: string
    nickname?: string
    bio?: string
    jobTitle?: string
    company?: string
    location?: string
    profileImageUrl?: string
    coverImageUrl?: string
    postsCount?: number
    followersCount?: number
    followingCount?: number
    isPublic?: boolean
    allowFollow?: boolean
}

export const useCommunityProfile = () => {
    const [profile, setProfile] = useState<CommunityProfile | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const userId = getCurrentUserId()

    const fetchProfile = async () => {
        if (!userId) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`http://localhost:8080/api/community/profile/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data: CommunityProfile = await response.json()
                setProfile(data)
            } else if (response.status === 404) {
                // 프로필이 없으면 기본값 설정
                setProfile({
                    displayName: "사용자",
                    nickname: "",
                    bio: "",
                    profileImageUrl: "/placeholder.svg?height=32&width=32"
                })
            } else {
                throw new Error('프로필 로드 실패')
            }
        } catch (err) {
            console.error('프로필 로드 에러:', err)
            setError('프로필을 불러올 수 없습니다.')
            // 에러 시에도 기본값 설정
            setProfile({
                displayName: "사용자",
                nickname: "",
                bio: "",
                profileImageUrl: "/placeholder.svg?height=32&width=32"
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [userId])

    return {
        profile,
        loading,
        error,
        refetch: fetchProfile
    }
}