"use client"

import SideLayout from "../sidebar/SideLayout";
import {useEffect, useState} from "react"
import { useRouter } from "next/navigation";
import { UpwardMenu } from "../components/upward-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Share2, Bookmark, Search, Users, UserMinus } from "lucide-react"
import {
  getFollowingList,
  toggleFollow
} from "@/lib/post-api"
import { getCurrentUserId } from "@/utils/auth"

// 사용자 타입 정의
interface User {
  id: number
  userId?: string
  name: string
  profileImage?: string
  title: string
  followersCount: number
  followingCount?: number
  postsCount: number
  isFollowing: boolean
}


export default function FollowPage() {
  const [followingUsers, setFollowingUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const currentUserId = getCurrentUserId()

  useEffect(() => {
    const fetchFollowingUsers = async () => {
      if (!currentUserId) {
        console.error('사용자 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        console.log('팔로잉 목록 조회 시도:', currentUserId);

        // post-api.ts의 getFollowingList 함수 사용
        const response = await getFollowingList(currentUserId);
        const followData = response.data;

        console.log('팔로우 데이터:', followData);

        if (Array.isArray(followData) && followData.length > 0) {
          // 🔥 수정된 데이터 변환 로직
          const users: User[] = followData.map((follow: any) => {
            console.log('개별 팔로우 데이터:', follow);
            const followingUser = follow.following;

            return {
              id: followingUser.id,
              userId: followingUser.userId || `user${followingUser.id}`,
              name: followingUser.name,
              profileImage: followingUser.profileImage,

              // 🔥 실제 서버 데이터 사용 (랜덤 값 제거!)
              title: followingUser.title || "직책 없음",
              followersCount: followingUser.followersCount || 0,
              followingCount: followingUser.followingCount || 0,
              postsCount: followingUser.postsCount || 0,

              isFollowing: true
            };
          });

          setFollowingUsers(users);
          console.log('변환된 사용자 목록:', users);
        } else {
          console.log('팔로우 데이터가 비어있습니다.');
          setFollowingUsers([]);
        }
      } catch (error) {
        console.error('팔로잉 목록 조회 중 오류:', error);
        setFollowingUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingUsers();
  }, [currentUserId]);

  // 페이지에 포커스될 때마다 새로고침 (다른 페이지에서 팔로우했을 때 반영)
  useEffect(() => {
    const handleFocus = () => {
      if (currentUserId && !loading) {
        console.log('페이지 포커스, 팔로우 목록 새로고침');
        // 여기서 다시 fetchFollowingUsers 호출
        window.location.reload(); // 임시 방법
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentUserId, loading]);

  // 검색어에 따른 사용자 필터링
  const filteredUsers = followingUsers.filter(
      (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.userId && user.userId.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // 언팔로우 처리
  const handleUnfollow = async (targetUserId: number) => {
    if (!currentUserId) return;

    try {
      // 🔥 올바른 API 엔드포인트 사용
      const response = await fetch(`http://localhost:8080/api/follows/toggle?followerId=${currentUserId}&followingId=${targetUserId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('팔로우 토글 결과:', result);

        // 🔥 서버 응답 확인 후 UI 업데이트
        if (result.success && !result.following) {
          // 언팔로우 성공 시 목록에서 제거
          setFollowingUsers(prevUsers =>
              prevUsers.filter(user => user.id !== targetUserId)
          );
          console.log('언팔로우 성공');
        } else if (result.success && result.following) {
          console.log('다시 팔로우됨 (예상치 못한 상황)');
        }
      } else {
        const errorText = await response.text();
        console.error('언팔로우 실패:', response.status, errorText);
        alert('언팔로우 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('언팔로우 중 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  return (
      <SideLayout>
        <div className="flex-1 min-h-screen bg-violet-50 overflow-y-auto pl-6">
          <div className="w-full max-w-[1200px] mx-auto px-12 md:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6 pt-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
                <Users className="mr-2 h-6 w-6" />
                팔로우 ({followingUsers.length})
              </h1>
              <p className="text-gray-500">팔로우 중인 사용자를 확인하세요.</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    placeholder="사용자 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-[#6366f1] focus:ring-[#6366f1]"
                />
              </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                      <Card key={user.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage
                                    src={user.profileImage ? `http://localhost:8080${user.profileImage}` : "/placeholder.svg?height=48&width=48"}
                                />
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                <p className="text-sm text-gray-500">{user.title}</p>
                                <p className="text-xs text-gray-400">ID: {user.id}</p>
                              </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnfollow(user.id)}
                                className="border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/10 hover:text-[#6366f1]"
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              팔로잉
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-2 pb-4">
                          <div className="flex justify-between text-sm">
                            <div>
                              <p className="font-medium">{user.followersCount}</p>
                              <p className="text-gray-500">팔로워</p>
                            </div>
                            <div>
                              <p className="font-medium">{user.postsCount}</p>
                              <p className="text-gray-500">게시글</p>
                            </div>
                            <div>
                              <Button variant="ghost" size="sm" className="text-[#6366f1] p-0 h-auto hover:bg-transparent">
                                프로필 보기
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                  ))
              ) : (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-white rounded-lg shadow-sm">
                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery ? "검색 결과가 없습니다" : "팔로우하는 사용자가 없습니다"}
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {searchQuery ? "다른 검색어로 시도해보세요." : "피드에서 다른 사용자들을 팔로우해보세요."}
                    </p>
                    <Button
                        onClick={() => router.push("/community/feed")}
                        className="mt-4"
                    >
                      피드로 이동
                    </Button>
                  </div>
              )}
            </div>
          </div>

          <UpwardMenu
              className="fixed bottom-6 right-6 z-[999]"
              onFollowClick={() => router.push("/community/follow")}
              onMyPostsClick={() => router.push("/community/write")}
              onMyCommentsClick={() => router.push("/community/reply")}
              onSavedClick={() => router.push("/community/bookmark")}
          />
        </div>
      </SideLayout>
  )
}