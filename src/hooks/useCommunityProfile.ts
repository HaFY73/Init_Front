import { useState, useEffect } from 'react'
import { getCurrentUserId } from '@/utils/auth'
import { mockProfile, isDevelopmentMode } from '@/lib/mock-data'

interface CommunityProfile {
    id?: number
    displayName: string
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
                },
                signal: AbortSignal.timeout(3000) // 3초 타임아웃
            })

            if (response.ok) {
                const data: CommunityProfile = await response.json()
                
                // 이미지 URL 처리 (base64는 그대로, 상대경로는 절대경로로 변환)
                if (data.profileImageUrl && !data.profileImageUrl.startsWith('data:') && data.profileImageUrl.startsWith('/')) {
                    data.profileImageUrl = `http://localhost:8080${data.profileImageUrl}`
                }
                
                setProfile(data)
            } else if (response.status === 404) {
                // 프로필이 없으면 기본값 설정
                setProfile({
                    displayName: "사용자",
                    bio: "",
                    profileImageUrl: "/placeholder.svg?height=32&width=32"
                })
            } else {
                throw new Error('프로필 로드 실패')
            }
        } catch (err) {
            console.error('프로필 로드 에러:', err)
            
            // 개발 환경에서 네트워크 에러인 경우 목 데이터 사용
            if (isDevelopmentMode() && err instanceof Error && 
                (err.message.includes('fetch') || err.message.includes('timeout') || err.name === 'TypeError')) {
                
                console.log('🔄 목 프로필 데이터를 사용합니다...')
                setProfile(mockProfile)
                setError(null)
            } else {
                setError('프로필을 불러올 수 없습니다.')
                // 에러 시에도 기본값 설정
                setProfile({
                    displayName: "사용자",
                    bio: "",
                    profileImageUrl: "/placeholder.svg?height=32&width=32"
                })
            }
            
            // 개발 환경에서만 추가 로그
            if (process.env.NODE_ENV === 'development') {
                console.log('⚠️ 백엔드 서버 연결 실패. 목 데이터를 사용합니다.')
                console.log('백엔드 서버(localhost:8080)가 실행 중인지 확인해주세요.')
            }
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
