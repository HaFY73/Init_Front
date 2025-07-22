"use client"

import SideLayout from "../sidebar/SideLayout";
import { useState } from "react"
import { useRouter } from "next/navigation";
import { UpwardMenu } from "../components/upward-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Heart,
  MessageCircle,
  Search,
  BookmarkIcon as BookmarkIconLucide,
  Trash2,
  ArrowUpRight,
  Folder,
  type LucideIcon,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CategoryInfo {
  label: string
  key: string
  color: string
  icon?: LucideIcon
}

// 게시글 타입 정의
interface Post {
  id: number
  author: {
    name: string
    avatar: string
    title: string
  }
  content: string
  image?: string
  hashtags: string[]
  likes: number
  comments: number
  timeAgo: string
  category: string
  bookmarkedAt: string
  folder?: string
}

// 카테고리 정의
const allCategories: CategoryInfo[] = [
  { label: "경영/기획/전략", key: "management", color: "#3498db" },
  { label: "디자인/컨텐츠", key: "design", color: "#e74c3c" },
  { label: "개발/IT", key: "dev", color: "#356ae4" },
  { label: "마케팅/브랜딩", key: "marketing", color: "#f39c12" },
  { label: "영업/고객관리", key: "sales", color: "#27ae60" },
  { label: "교육/강의/연구", key: "education", color: "#9b59b6" },
  { label: "운영/사무관리", key: "operations", color: "#34495e" },
  { label: "생산/물류/품질관리", key: "logistics", color: "#795548" },
  { label: "사회/공공기관", key: "public", color: "#607d8b" },
  { label: "특수직", key: "special", color: "#ff5722" },
]

// 저장한 게시글 목데이터
const mockBookmarkedPosts: Post[] = [
  {
    id: 1,
    author: { name: "김개발", avatar: "/placeholder.svg?height=40&width=40", title: "프론트엔드 개발자" },
    content:
      "신입 개발자로 첫 직장을 구하는 팁을 공유합니다. 포트폴리오 작성부터 면접 준비까지 상세하게 알려드릴게요. React와 Next.js를 활용한 프로젝트 경험이 정말 중요합니다.",
    image: "/placeholder.svg?height=200&width=300",
    hashtags: ["#신입개발자", "#취업팁", "#포트폴리오", "#React"],
    likes: 24,
    comments: 8,
    timeAgo: "2시간 전",
    category: "dev",
    bookmarkedAt: "2023-06-12T10:30:00",
    folder: "취업 준비",
  },
  {
    id: 2,
    author: { name: "박디자인", avatar: "/placeholder.svg?height=40&width=40", title: "UX/UI 디자이너" },
    content:
      "디자인 포트폴리오 작성 시 주의사항과 면접에서 자주 나오는 질문들을 정리해봤어요. 사용자 경험을 중심으로 한 디자인 사고 과정을 보여주는 것이 핵심입니다.",
    hashtags: ["#UX디자인", "#포트폴리오", "#디자인면접"],
    likes: 31,
    comments: 12,
    timeAgo: "4시간 전",
    category: "design",
    bookmarkedAt: "2023-06-11T15:45:00",
    folder: "포트폴리오 참고",
  },
  {
    id: 3,
    author: { name: "이기획", avatar: "/placeholder.svg?height=40&width=40", title: "프로덕트 매니저" },
    content:
      "스타트업 vs 대기업, 어디서 커리어를 시작할까요? 각각의 장단점을 비교해보겠습니다. PM으로서의 경험을 바탕으로 실무진의 관점에서 조언드립니다.",
    image: "/placeholder.svg?height=200&width=300",
    hashtags: ["#커리어", "#스타트업", "#대기업", "#PM"],
    likes: 45,
    comments: 18,
    timeAgo: "6시간 전",
    category: "management",
    bookmarkedAt: "2023-06-10T18:20:00",
    folder: "취업 준비",
  },
  {
    id: 4,
    author: { name: "최마케팅", avatar: "/placeholder.svg?height=40&width=40", title: "디지털 마케터" },
    content:
      "이직을 고민하고 있다면 꼭 확인해야 할 체크리스트입니다. 연봉 협상부터 회사 문화까지, 놓치기 쉬운 부분들을 체크해보세요. 마케팅 커리어의 가치 평가 방법도 함께 공유합니다.",
    hashtags: ["#이직", "#연봉협상", "#마케팅커리어"],
    likes: 38,
    comments: 15,
    timeAgo: "8시간 전",
    category: "marketing",
    bookmarkedAt: "2023-06-09T09:15:00",
    folder: "면접 준비",
  },
  {
    id: 5,
    author: { name: "정영업", avatar: "/placeholder.svg?height=40&width=40", title: "세일즈 매니저" },
    content:
      "B2B 영업 직무로 전환하면서 배운 것들을 공유합니다. 고객 관계 관리와 세일즈 프로세스의 중요성, 그리고 성과를 내기 위한 실전 노하우까지 모두 담았습니다.",
    image: "/placeholder.svg?height=200&width=300",
    hashtags: ["#B2B영업", "#세일즈", "#고객관리"],
    likes: 52,
    comments: 22,
    timeAgo: "1일 전",
    category: "sales",
    bookmarkedAt: "2023-06-08T14:30:00",
    folder: "취업 준비",
  },
  {
    id: 6,
    author: { name: "한인사", avatar: "/placeholder.svg?height=40&width=40", title: "HR 매니저" },
    content:
      "채용 담당자가 알려주는 이력서 작성 꿀팁! 수많은 이력서를 검토하면서 발견한 합격하는 이력서의 공통점들을 정리했습니다. 인사담당자의 시선에서 본 포인트들을 공유해요.",
    hashtags: ["#이력서", "#채용", "#HR팁"],
    likes: 67,
    comments: 28,
    timeAgo: "1일 전",
    category: "operations",
    bookmarkedAt: "2023-06-07T11:20:00",
    folder: "포트폴리오 참고",
  },
  {
    id: 7,
    author: { name: "송데이터", avatar: "/placeholder.svg?height=40&width=40", title: "데이터 사이언티스트" },
    content:
      "데이터 사이언티스트 포트폴리오 작성법과 취업 준비 방법을 공유합니다. 실무에서 중요하게 생각하는 역량과 프로젝트 경험에 대해 설명드립니다.",
    image: "/placeholder.svg?height=200&width=300",
    hashtags: ["#데이터사이언스", "#취업준비", "#포트폴리오"],
    likes: 42,
    comments: 15,
    timeAgo: "2일 전",
    category: "dev",
    bookmarkedAt: "2023-06-06T16:45:00",
    folder: "기술 스택",
  },
  {
    id: 8,
    author: { name: "강백엔드", avatar: "/placeholder.svg?height=40&width=40", title: "백엔드 개발자" },
    content:
      "백엔드 개발자가 알아야 할 시스템 설계 원칙과 아키텍처 패턴에 대해 정리했습니다. 실무에서 자주 사용되는 패턴과 그 장단점을 비교해봅니다.",
    hashtags: ["#백엔드개발", "#시스템설계", "#아키텍처"],
    likes: 56,
    comments: 23,
    timeAgo: "3일 전",
    category: "dev",
    bookmarkedAt: "2023-06-05T13:10:00",
    folder: "기술 스택",
  },
]

export default function BookmarkPage() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>(mockBookmarkedPosts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>("all") // Changed name
  const [selectedFolder] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent")
  const [viewMode] = useState<"grid" | "list">("grid")
  const router = useRouter();

  // 검색어, 카테고리, 폴더, 정렬 기준에 따른 게시글 필터링
  const filteredPosts = bookmarkedPosts
    .filter(
      (post) =>
        (searchQuery === "" ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.hashtags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          post.author.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedCategoryKey === "all" || selectedCategoryKey === null || post.category === selectedCategoryKey) && // Updated condition
        (selectedFolder === null || post.folder === selectedFolder),
    )
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()
      } else {
        // sortBy === "oldest"
        return new Date(a.bookmarkedAt).getTime() - new Date(b.bookmarkedAt).getTime()
      }
    })

  // 북마크 삭제 처리
  const handleRemoveBookmark = (postId: number) => {
    setBookmarkedPosts(bookmarkedPosts.filter((post) => post.id !== postId))
  }

  return (
    <SideLayout>
      <div className="flex-1 min-h-screen bg-violet-50 pl-6">
        <div className="px-6 py-8 w-full max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-6 pt-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
              <BookmarkIconLucide className="mr-2 h-6 w-6" />
              저장한 글
            </h1>
            <p className="text-gray-500">나중에 다시 보기 위해 저장한 게시글을 확인하세요.</p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="게시글, 해시태그, 작성자 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-[#356ae4] focus:ring-[#356ae4]"
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={selectedCategoryKey || "all"}
                onValueChange={(value) => setSelectedCategoryKey(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="카테고리 전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">카테고리 전체</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem key={category.key} value={category.key}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as "recent" | "oldest")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">최신순</SelectItem>
                  <SelectItem value="oldest">오래된순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Folders and Content */}
          <div className="flex flex-col md:flex-row gap-6 pb-20">
            {" "}
            {/* Added pb-20 for menu visibility */}

            {/* Main Content */}
            <div className="flex-1">
              {filteredPosts.length > 0 ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
                  {filteredPosts.map((post) => {
                    const categoryInfo = allCategories.find((c) => c.key === post.category)
                    return (
                      <Card key={post.id} className="bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={post.author.avatar || "/placeholder.svg?height=40&width=40&query=author+avatar"}
                                />
                                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{post.author.name}</p>
                                <p className="text-xs text-gray-500">{post.author.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {categoryInfo && (
                                <Badge
                                  style={{
                                    backgroundColor: `${categoryInfo.color}20`,
                                    color: categoryInfo.color,
                                  }}
                                  className="font-normal"
                                >
                                  {categoryInfo.label}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs font-normal">
                                {new Date(post.bookmarkedAt).toLocaleDateString()} 저장
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pb-3 flex-grow">
                          <p className={`text-sm text-gray-700 mb-3 ${viewMode === "grid" ? "line-clamp-3" : ""}`}>
                            {post.content}
                          </p>

                          {post.image && (
                            <div className="mb-3">
                              <img
                                src={post.image || "/placeholder.svg?height=120&width=360&query=post+image"}
                                alt="Post image"
                                className={`w-full object-cover rounded-md ${viewMode === "grid" ? "h-[120px]" : "max-h-[200px]"}`}
                              />
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.hashtags.slice(0, viewMode === "grid" ? 3 : 5).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs bg-[#356ae4]/10 text-[#356ae4] hover:bg-[#356ae4]/20"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>

                        <CardFooter className="pt-3 pb-4 border-t border-gray-100 bg-gray-50/50">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center text-gray-500 text-sm">
                                <Heart className="h-4 w-4 mr-1" />
                                {post.likes}
                              </div>
                              <div className="flex items-center text-gray-500 text-sm">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {post.comments}
                              </div>
                              {post.folder && (
                                <Badge variant="outline" className="text-xs font-normal">
                                  <Folder className="h-3 w-3 mr-1" />
                                  {post.folder}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-[#356ae4] border-[#356ae4] hover:bg-[#356ae4]/10"
                              >
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                보기
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
                                onClick={() => handleRemoveBookmark(post.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <BookmarkIconLucide className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">저장한 게시글이 없습니다</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    아직 저장한 게시글이 없거나, 검색 조건에 맞는 게시글이 없습니다.
                  </p>
                </div>
              )}
            </div>
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
