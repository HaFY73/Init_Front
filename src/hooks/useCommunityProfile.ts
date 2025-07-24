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
    const [hasProfile, setHasProfile] = useState<boolean>(false) // 🔥 프로필 존재 여부 명시적 관리

    const userId = getCurrentUserId()

    const fetchProfile = async () => {
        if (!userId) {
            setProfile(null)
            setHasProfile(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`http://localhost:8080/api/community/profile/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(3000)
            })

            if (response.ok) {
                const data: CommunityProfile = await response.json()

                // 이미지 URL 처리
                if (data.profileImageUrl && !data.profileImageUrl.startsWith('data:') && data.profileImageUrl.startsWith('/')) {
                    data.profileImageUrl = `http://localhost:8080${data.profileImageUrl}`
                }

                setProfile(data)
                setHasProfile(true) // 🔥 실제 프로필 존재
                console.log('✅ 프로필 로드 성공:', data)
            } else if (response.status === 404) {
                // 🔥 프로필이 없는 경우 null로 설정 (기본값 설정 안함)
                console.log('ℹ️ 커뮤니티 프로필이 존재하지 않습니다')
                setProfile(null)
                setHasProfile(false)
            } else {
                throw new Error('프로필 로드 실패')
            }
        } catch (err) {
            console.error('프로필 로드 에러:', err)

            // 개발 환경에서 네트워크 에러인 경우에만 목 데이터 사용
            if (isDevelopmentMode() && err instanceof Error &&
                (err.message.includes('fetch') || err.message.includes('timeout') || err.name === 'TypeError')) {

                console.log('🔄 목 프로필 데이터를 사용합니다...')
                setProfile(mockProfile)
                setHasProfile(true)
                setError(null)
            } else {
                setError('프로필을 불러올 수 없습니다.')
                setProfile(null) // 🔥 에러 시에도 null 설정
                setHasProfile(false)
            }

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
        hasProfile, // 🔥 프로필 존재 여부 반환
        refetch: fetchProfile
    }
}