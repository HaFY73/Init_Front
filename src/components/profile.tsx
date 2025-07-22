"use client"

import { useState, useRef, useEffect } from "react"
import { useProfileDialog } from "@/contexts/ProfileDialogContext"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, User, Briefcase, MapPin, Building2, Lock } from "lucide-react"
import { getCurrentUserId } from "@/utils/auth"

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

// 간단한 토글 스위치 컴포넌트
const SimpleToggle = ({ checked, onChange, label }: {
  checked: boolean,
  onChange: (checked: boolean) => void,
  label: string
}) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium">{label}</span>
      <button
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              checked ? 'bg-violet-500' : 'bg-gray-400'
          }`}
      >
      <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
          }`}
      />
      </button>
    </div>
)

// 간단한 구분선 컴포넌트
const SimpleSeparator = () => (
    <div className="my-6 border-t border-gray-200" />
)

export default function ProfileDialog() {
  const { isOpen, setIsOpen } = useProfileDialog()
  const [profileImage, setProfileImage] = useState<string>("/placeholder.svg?height=96&width=96")
  const [coverImage, setCoverImage] = useState<string>("")
  const profileFileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<CommunityProfile>({
    displayName: "",
    nickname: "",
    bio: "",
    jobTitle: "",
    company: "",
    location: "",
    isPublic: true,
    allowFollow: true,
    postsCount: 0,
    followersCount: 0,
    followingCount: 0
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

  // 현재 사용자 ID 가져오기
  const userId = getCurrentUserId()

  useEffect(() => {
    if (isOpen && userId) {
      loadCommunityProfile()
    }
  }, [isOpen, userId])

  // 커뮤니티 프로필 로드
  const loadCommunityProfile = async () => {
    if (!userId) return

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/api/community/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data: CommunityProfile = await response.json()
        setProfile({
          id: data.id,
          displayName: data.displayName || "",
          nickname: data.nickname || "",
          bio: data.bio || "",
          jobTitle: data.jobTitle || "",
          company: data.company || "",
          location: data.location || "",
          isPublic: data.isPublic ?? true,
          allowFollow: data.allowFollow ?? true,
          postsCount: data.postsCount || 0,
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0
        })

        if (data.profileImageUrl) {
          setProfileImage(data.profileImageUrl)
        }

        if (data.coverImageUrl) {
          setCoverImage(data.coverImageUrl)
        }
      } else if (response.status === 404) {
        console.log('커뮤니티 프로필이 없습니다. 새로 생성할 예정입니다.')
      } else {
        const errorText = await response.text()
        console.error('프로필 로드 실패:', errorText)
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 프로필 저장
  const handleSave = async () => {
    if (!userId || !profile.displayName.trim()) {
      alert('표시 이름은 필수입니다.')
      return
    }

    setSaving(true)
    try {
      const method = profile.id ? 'PUT' : 'POST'
      const response = await fetch(`http://localhost:8080/api/community/profile/${userId}`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName: profile.displayName,
          nickname: profile.nickname,
          bio: profile.bio,
          jobTitle: profile.jobTitle,
          company: profile.company,
          location: profile.location,
          profileImageUrl: profileImage !== "/placeholder.svg?height=96&width=96" ? profileImage : null,
          coverImageUrl: coverImage || null,
          isPublic: profile.isPublic,
          allowFollow: profile.allowFollow
        })
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(prev => ({
          ...prev,
          id: updatedProfile.id,
          nickname: updatedProfile.nickname,
          postsCount: updatedProfile.postsCount,
          followersCount: updatedProfile.followersCount,
          followingCount: updatedProfile.followingCount
        }))
        alert('프로필이 성공적으로 저장되었습니다!')
        setIsOpen(false)
      } else {
        const errorText = await response.text()
        console.error('프로필 저장 실패:', errorText)
        alert(`프로필 저장에 실패했습니다: ${errorText}`)
      }
    } catch (error) {
      console.error('프로필 저장 실패:', error)
      alert('프로필 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  // 프로필 이미지 변경
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.')
        return
      }

      setImageUploading(true)
      try {
        const tempUrl = URL.createObjectURL(file)
        setProfileImage(tempUrl)
      } catch (error) {
        console.error('이미지 처리 실패:', error)
        alert('이미지 처리에 실패했습니다.')
      } finally {
        setImageUploading(false)
      }
    }
  }

  // 커버 이미지 변경
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file.size > 10 * 1024 * 1024) {
        alert('커버 이미지 크기는 10MB 이하여야 합니다.')
        return
      }

      setImageUploading(true)
      try {
        const tempUrl = URL.createObjectURL(file)
        setCoverImage(tempUrl)
      } catch (error) {
        console.error('커버 이미지 처리 실패:', error)
        alert('커버 이미지 처리에 실패했습니다.')
      } finally {
        setImageUploading(false)
      }
    }
  }

  return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-white shadow-lg"
                       style={{
                         position: "absolute",
                         top: "50%",
                         left: "calc((100% - 250px) / 2 + 250px)", // ← 240px은 사이드바 너비
                         transform: "translate(-50%, -50%)",
                       }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              커뮤니티 프로필 관리
            </DialogTitle>
            <DialogDescription>
              커뮤니티에서 사용할 프로필 정보를 설정하세요.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
              </div>
          ) : (
              <div className="space-y-6">
                {/* 커버 이미지 섹션 */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">커버 이미지</label>
                  <div
                      className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg cursor-pointer overflow-hidden group"
                      onClick={() => coverFileInputRef.current?.click()}
                  >
                    {coverImage && (
                        <img
                            src={coverImage}
                            alt="커버 이미지"
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImageIcon className="h-8 w-8 text-white" />
                    </div>
                    {imageUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                    )}
                  </div>
                  <input
                      type="file"
                      accept="image/*"
                      ref={coverFileInputRef}
                      onChange={handleCoverImageChange}
                      className="hidden"
                  />
                </div>

                {/* 프로필 이미지 섹션 */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar
                        className="h-24 w-24 cursor-pointer ring-4 ring-white -mt-12 relative z-10"
                        onClick={() => profileFileInputRef.current?.click()}
                    >
                      <AvatarImage src={profileImage} />
                      <AvatarFallback className="text-lg">
                        {profile.displayName.charAt(0) || '사'}
                      </AvatarFallback>
                    </Avatar>
                    {imageUploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                    )}
                  </div>

                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => profileFileInputRef.current?.click()}
                      disabled={imageUploading}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    프로필 사진 변경
                  </Button>

                  <input
                      type="file"
                      accept="image/*"
                      ref={profileFileInputRef}
                      onChange={handleProfileImageChange}
                      className="hidden"
                  />

                  {/* 활동 통계 */}
                  <div className="flex gap-6 text-sm text-gray-600">
                    <div className="text-center">
                      <div className="font-semibold">{profile.postsCount}</div>
                      <div>게시글</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{profile.followersCount}</div>
                      <div>팔로워</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{profile.followingCount}</div>
                      <div>팔로잉</div>
                    </div>
                  </div>
                </div>

                <SimpleSeparator />

                {/* 기본 정보 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="displayName" className="text-sm font-medium flex items-center gap-1">
                      표시 이름 <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="displayName"
                        placeholder="커뮤니티에서 표시될 이름"
                        value={profile.displayName}
                        onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                        maxLength={20}
                    />
                    <p className="text-xs text-gray-500">
                      {profile.displayName.length}/20
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="nickname" className="text-sm font-medium">닉네임 (고유 ID)</label>
                    <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                    @
                  </span>
                      <Input
                          id="nickname"
                          placeholder="영문, 숫자, _ 사용 가능"
                          value={profile.nickname}
                          onChange={(e) => {
                            const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                            setProfile({...profile, nickname: value})
                          }}
                          maxLength={20}
                          className="rounded-l-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      영문, 숫자, 밑줄(_)만 사용 가능 • {profile.nickname?.length || 0}/20
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="jobTitle" className="text-sm font-medium flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      직책
                    </label>
                    <Input
                        id="jobTitle"
                        placeholder="예: 프론트엔드 개발자"
                        value={profile.jobTitle}
                        onChange={(e) => setProfile({...profile, jobTitle: e.target.value})}
                        maxLength={30}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-medium flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      회사
                    </label>
                    <Input
                        id="company"
                        placeholder="예: 카카오"
                        value={profile.company}
                        onChange={(e) => setProfile({...profile, company: e.target.value})}
                        maxLength={30}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      지역
                    </label>
                    <Input
                        id="location"
                        placeholder="예: 서울"
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                        maxLength={20}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">소개</label>
                    <Textarea
                        id="bio"
                        placeholder="간단한 자기소개를 작성하세요"
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        maxLength={200}
                        rows={3}
                    />
                    <p className="text-xs text-gray-500">
                      {profile.bio?.length || 0}/200
                    </p>
                  </div>
                </div>

                <SimpleSeparator />

                {/* 프로필 설정 */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    프로필 설정
                  </h4>

                  <SimpleToggle
                      label="공개 프로필"
                      checked={profile.isPublic || false}
                      onChange={(checked) => setProfile({...profile, isPublic: checked})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    다른 사용자가 내 프로필을 볼 수 있습니다
                  </p>

                  <SimpleToggle
                      label="팔로우 허용"
                      checked={profile.allowFollow || false}
                      onChange={(checked) => setProfile({...profile, allowFollow: checked})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    다른 사용자가 나를 팔로우할 수 있습니다
                  </p>
                </div>
              </div>
          )}

          <DialogFooter>
            <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={saving}
            >
              취소
            </Button>
            <Button
                className="bg-[#6366f1] hover:bg-[#6366f1]/90"
                onClick={handleSave}
                disabled={saving || !profile.displayName.trim() || imageUploading}
            >
              {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    저장중...
                  </>
              ) : (
                  '저장하기'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}