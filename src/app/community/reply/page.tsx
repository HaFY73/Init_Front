"use client"

import SideLayout from "../sidebar/SideLayout";
import { useState } from "react"
import { useRouter } from "next/navigation";
import { UpwardMenu } from "../components/upward-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  Search,
  MessageSquare,
  Calendar,
  type LucideIcon,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CategoryInfo {
  label: string
  key: string
  color: string
  icon?: LucideIcon // Optional: if you want to add icons to categories later
}
// 댓글 타입 정의
interface MyComment {
  // Renamed from Comment to MyComment to avoid conflict
  id: number
  postId: number
  content: string
  createdAt: string
  likes: number
}

// 게시글 타입 정의
interface PostWithMyComment {
  // Renamed from Post to PostWithMyComment
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
  myComment: MyComment // Use the renamed MyComment type
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

// 내가 댓글 단 게시글 목데이터
const mockCommentedPosts: PostWithMyComment[] = [
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
    myComment: {
      id: 101,
      postId: 1,
      content: "정말 유익한 정보 감사합니다! 포트폴리오에 어떤 프로젝트를 넣는 것이 좋을까요?",
      createdAt: "2023-06-12T10:30:00",
      likes: 3,
    },
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
    myComment: {
      id: 102,
      postId: 2,
      content: "포트폴리오에 몇 개의 프로젝트를 넣는 것이 적당할까요? 디자인 과정을 상세히 보여주는 것이 중요할까요?",
      createdAt: "2023-06-11T15:45:00",
      likes: 4,
    },
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
    myComment: {
      id: 103,
      postId: 3,
      content: "스타트업에서 일하려면 어떤 역량이 가장 중요할까요? 대기업과 스타트업 모두 경험해보셨나요?",
      createdAt: "2023-06-10T18:20:00",
      likes: 6,
    },
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
    myComment: {
      id: 104,
      postId: 4,
      content: "연봉 협상할 때 어떤 점을 중점적으로 어필하면 좋을까요? 마케팅 성과를 어떻게 수치화할 수 있을까요?",
      createdAt: "2023-06-09T09:15:00",
      likes: 5,
    },
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
    myComment: {
      id: 105,
      postId: 5,
      content: "B2B 영업에서 가장 중요한 스킬은 무엇인가요? 고객과의 첫 미팅에서 어떤 점을 중점적으로 준비하시나요?",
      createdAt: "2023-06-08T14:30:00",
      likes: 7,
    },
  },
]

export default function ReplyPage() {
  const [commentedPosts] = useState<PostWithMyComment[]>(mockCommentedPosts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>("all") // Changed from selectedCategory
  const [sortBy, setSortBy] = useState<"recent" | "likes">("recent")
  const router = useRouter();

  // 검색어, 카테고리, 정렬 기준에 따른 게시글 필터링
  const filteredPosts = commentedPosts
    .filter(
      (post) =>
        (searchQuery === "" ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.hashtags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.myComment.content.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedCategoryKey === "all" || selectedCategoryKey === null || post.category === selectedCategoryKey), // Adjusted condition
    )
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.myComment.createdAt).getTime() - new Date(a.myComment.createdAt).getTime()
      } else {
        // sortBy === "likes"
        return b.myComment.likes - a.myComment.likes
      }
    })

  // 댓글 삭제 처리
  const PostCardDisplay = ({ post }: { post: PostWithMyComment }) => {
    allCategories.find((c) => c.key === post.category);
    return (
      <Card key={post.id} className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-md p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>나</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-800">&#34;{post.myComment.content}&#34;</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(post.myComment.createdAt).toLocaleDateString()} • {post.author.name}의 게시글
              </p>
            </div>
          </div>
        </div>

        <div className="pl-11">
          <p className="text-sm text-[#6495ED] line-clamp-2">{post.content}</p>
          <div className="mt-1 text-xs text-gray-400 flex items-center gap-2">
            <span>{post.timeAgo}</span>
            <span>·</span>
            <span>{post.likes} 좋아요</span>
            <span>{post.comments} 댓글</span>
          </div>
        </div>
      </Card>
    )
  }

  const EmptyState = ({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) => (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
      <Icon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto">{description}</p>
    </div>
  )

  return (
    <SideLayout>
      <div className="flex-1 min-h-screen bg-orange-50 pl-6">
        <div className="px-6 py-8 w-full max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-6 pt-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
              <MessageSquare className="mr-2 h-6 w-6" />
              내 댓글
            </h1>
            <p className="text-gray-500">내가 작성한 댓글과 해당 게시글을 확인하세요.</p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="게시글, 댓글, 해시태그, 작성자 검색..."
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

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as "recent" | "likes")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">최신순</SelectItem>
                  <SelectItem value="likes">좋아요순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="pb-20">
            {" "}
            <TabsContent value="all" className="mt-0">
              {filteredPosts.length > 0 ? (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <PostCardDisplay key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="댓글을 작성한 게시글이 없습니다"
                  description="아직 댓글을 작성하지 않았거나, 검색 조건에 맞는 게시글이 없습니다."
                  icon={MessageSquare}
                />
              )}
            </TabsContent>
            <TabsContent value="today" className="mt-0">
              <EmptyState
                title="오늘 작성한 댓글이 없습니다"
                description="오늘 작성한 댓글이 없거나, 검색 조건에 맞는 게시글이 없습니다."
                icon={Calendar}
              />
            </TabsContent>
          </Tabs>
          <UpwardMenu
              className="fixed bottom-6 right-6 z-[999]"
              onFollowClick={() => router.push("/community/follow")}
              onMyPostsClick={() => router.push("/community/write")}
              onMyCommentsClick={() => router.push("/community/reply")}
              onSavedClick={() => router.push("/community/bookmark")}
          />
        </div>
      </div>
    </SideLayout>
  )
}
