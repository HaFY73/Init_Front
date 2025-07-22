"use client"

import SideLayout from "../sidebar/SideLayout";
import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "@/utils/auth"
import { createPost } from "@/lib/post-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import {
  PenSquare, FileText, Clock, Eye, ChevronDown, Hash, ImageIcon, X,
  Heart, MessageCircle, Share2, Bookmark, AlertCircle,
  Briefcase, Palette, Code, TrendingUp, Phone, BookOpen,
  ClipboardList, Package, Building, Star, Coffee, Lightbulb,
  GraduationCap, Target, Brain, Check, type LucideIcon
} from "lucide-react"
import { UpwardMenu } from "../components/upward-menu"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

// Types
interface Category {
  icon: LucideIcon
  label: string
  key: string
  color: string
  type: "job" | "topic"
}

interface Post {
  id: number
  content: string
  category: string
  hashtags: string[]
  image?: string
  status: "draft" | "published"
  createdAt: string
  likes: number
  comments: number
}

interface NewPost {
  category: string
  content: string
  hashtags: string
  image: string | null
}

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
const IMAGE_UPLOAD_URL = `${API_BASE_URL}/upload/image`
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const allCategories: Category[] = [
  { icon: Briefcase, label: "경영/기획/전략", key: "management", color: "#3498db", type: "job" },
  { icon: Palette, label: "디자인/컨텐츠", key: "design", color: "#e74c3c", type: "job" },
  { icon: Code, label: "개발/IT", key: "dev", color: "#356ae4", type: "job" },
  { icon: TrendingUp, label: "마케팅/브랜딩", key: "marketing", color: "#f39c12", type: "job" },
  { icon: Phone, label: "영업/고객관리", key: "sales", color: "#27ae60", type: "job" },
  { icon: BookOpen, label: "교육/강의/연구", key: "education", color: "#9b59b6", type: "job" },
  { icon: ClipboardList, label: "운영/사무관리", key: "operations", color: "#34495e", type: "job" },
  { icon: Package, label: "생산/물류/품질관리", key: "logistics", color: "#795548", type: "job" },
  { icon: Building, label: "사회/공공기관", key: "public", color: "#607d8b", type: "job" },
  { icon: Star, label: "특수직", key: "special", color: "#ff5722", type: "job" },
  { icon: Coffee, label: "일상공유", key: "daily", color: "#8B4513", type: "topic" },
  { icon: Lightbulb, label: "업무관련팁", key: "tips", color: "#FFD700", type: "topic" },
  { icon: GraduationCap, label: "커리어조언", key: "career", color: "#4B0082", type: "topic" },
  { icon: Target, label: "취업준비", key: "job-prep", color: "#DC143C", type: "topic" },
  { icon: Brain, label: "자기계발", key: "self-dev", color: "#1abc9c", type: "topic" },
]

// Custom Hooks
const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false)

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    // 파일 유효성 검사
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('이미지 크기는 5MB 이하여야 합니다.')
    }

    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('지원되지 않는 이미지 형식입니다.')
    }

    setIsUploading(true)

    try {
      // 서버에 업로드
      const formData = new FormData()
      formData.append('image', file)

      console.log('🔄 이미지 업로드 시작:', file.name)

      const response = await fetch(IMAGE_UPLOAD_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('accessToken')}`
        },
        body: formData
      })

      console.log('📡 업로드 응답:', response.status, response.statusText)

      if (response.ok) {
        const result = await response.json()
        console.log('✅ 업로드 성공:', result)

        // 서버에서 반환된 이미지 URL 처리
        const imageUrl = result.imageUrl || result.url || result.data?.imageUrl

        if (imageUrl) {
          // 절대 경로로 변환 (필요한 경우)
          const fullImageUrl = imageUrl.startsWith('http')
              ? imageUrl
              : `http://localhost:8080${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`

          console.log('🖼️ 최종 이미지 URL:', fullImageUrl)
          return fullImageUrl
        } else {
          throw new Error('서버에서 이미지 URL을 반환하지 않았습니다.')
        }
      } else {
        const errorText = await response.text()
        console.error('❌ 서버 업로드 실패:', errorText)
        throw new Error(`서버 업로드 실패: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ 이미지 업로드 에러:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }, [])

  return { uploadImage, isUploading }
}

const usePosts = (userId: number | null) => {
  const [drafts, setDrafts] = useState<Post[]>([])
  const [published, setPublished] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const getAuthHeaders = useCallback(() => ({
    'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
    'Content-Type': 'application/json'
  }), [])

  const loadDraftPosts = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/posts/user/${userId}/drafts`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setDrafts(data)
      }
    } catch (error) {
      console.error("임시저장 글 불러오기 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, getAuthHeaders])

  const loadPublishedPosts = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/posts/user/${userId}/published`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setPublished(data)
      }
    } catch (error) {
      console.error("발행된 게시글 불러오기 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, getAuthHeaders])

  return {
    drafts,
    published,
    isLoading,
    setDrafts,
    setPublished,
    loadDraftPosts,
    loadPublishedPosts
  }
}

// Component
export default function WritePage() {
  const userId = getCurrentUserId()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadImage, isUploading } = useImageUpload()
  const {
    drafts,
    published,
    setDrafts,
    setPublished,
    loadDraftPosts,
    loadPublishedPosts
  } = usePosts(userId)

  // State
  const [activeTab, setActiveTab] = useState<"write" | "drafts" | "published">("write")
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [categoryType, setCategoryType] = useState<"job" | "topic">("job")
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null)
  const [displayCategoryText, setDisplayCategoryText] = useState("카테고리 선택")
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [newPost, setNewPost] = useState<NewPost>({
    category: "",
    content: "",
    hashtags: "",
    image: null,
  })

  // Effects
  useEffect(() => {
    if (userId) {
      loadPublishedPosts()
      loadDraftPosts()
    }
  }, [userId, loadPublishedPosts, loadDraftPosts])

  // Computed values
  const visibleCategories = allCategories.filter(c => c.type === categoryType)
  const combinedCategories = allCategories

  // Handlers
  const resetForm = useCallback(() => {
    setNewPost({ category: "", content: "", hashtags: "", image: null })
    setEditingPost(null)
    setShowPreview(false)
    setSelectedCategoryKey(null)
    setDisplayCategoryText("카테고리 선택")
  }, [])

  const handleSavePost = useCallback(async (status: "draft" | "published") => {
    if (!userId) return

    const hashtagsArr = newPost.hashtags
        .split(",")
        .map(t => t.trim())
        .filter(Boolean)
        .map(t => t.startsWith("#") ? t : `#${t}`)

    const postData = {
      title: newPost.content.slice(0, 20) || "제목없음",
      content: newPost.content,
      category: selectedCategoryKey || "etc",
      hashtags: hashtagsArr,
      imageUrl: newPost.image || null,
      status: status,
      author: { id: userId }
    }

    try {
      await createPost(postData)
      alert(status === "published" ? "글이 발행되었습니다!" : "글이 임시저장되었습니다!")
      resetForm()
      setActiveTab(status === "draft" ? "drafts" : "published")

      // 목록 새로고침
      if (status === "draft") {
        loadDraftPosts()
      } else {
        loadPublishedPosts()
      }
    } catch (err) {
      console.error("글 저장 실패:", err)
      alert("글 저장에 실패했습니다.")
    }
  }, [userId, newPost, selectedCategoryKey, resetForm, loadDraftPosts, loadPublishedPosts])

  const handleEditPost = useCallback((post: Post) => {
    setEditingPost(post)
    setNewPost({
      category: post.category,
      content: post.content,
      hashtags: post.hashtags.join(", "),
      image: post.image || null
    })
    setActiveTab("write")
    setShowPreview(false)
  }, [])

  const handleImageUpload = useCallback(async (
      e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault()

    let file: File | null = null

    if ("dataTransfer" in e) {
      file = e.dataTransfer.files?.[0] || null
    } else {
      file = e.target.files?.[0] || null
    }

    if (!file) return

    try {
      // 임시 미리보기 먼저 표시
      const tempUrl = URL.createObjectURL(file)
      setNewPost(prev => ({ ...prev, image: tempUrl }))

      // 서버에 업로드
      const serverImageUrl = await uploadImage(file)

      // 서버 URL로 교체
      setNewPost(prev => ({ ...prev, image: serverImageUrl }))
      console.log('✅ 이미지 업로드 성공:', serverImageUrl)
    } catch (error) {
      alert(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.')
      console.error('❌ 이미지 업로드 에러:', error)
    }
  }, [uploadImage])

  const handleToggleStatus = useCallback((postToToggle: Post) => {
    const updatedPost: Post = {
      ...postToToggle,
      status: postToToggle.status === "draft" ? "published" : "draft"
    }

    if (postToToggle.status === "draft") {
      setDrafts(prev => prev.filter(d => d.id !== postToToggle.id))
      setPublished(prev => [updatedPost, ...prev])
    } else {
      setPublished(prev => prev.filter(p => p.id !== postToToggle.id))
      setDrafts(prev => [updatedPost, ...prev])
    }
  }, [setDrafts, setPublished])

  const handleDeletePost = useCallback(async (postToDelete: Post) => {
    // 삭제 확인
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return
    }

    try {
      // 서버에서 삭제
      const response = await fetch(`${API_BASE_URL}/posts/${postToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // 성공시 로컬 상태 업데이트
        if (postToDelete.status === "draft") {
          setDrafts(prev => prev.filter(d => d.id !== postToDelete.id))
        } else {
          setPublished(prev => prev.filter(p => p.id !== postToDelete.id))
        }
        alert("게시글이 삭제되었습니다.")
      } else {
        throw new Error('삭제 요청 실패')
      }
    } catch (error) {
      console.error("게시글 삭제 실패:", error)
      alert("게시글 삭제에 실패했습니다.")
    }
  }, [setDrafts, setPublished])

  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategoryKey(category.key)
    setNewPost(prev => ({ ...prev, category: category.key }))
    setDisplayCategoryText(category.label)
    setPopoverOpen(false)
  }, [])

  const handleCategoryTypeChange = useCallback((type: "job" | "topic") => {
    setCategoryType(type)
    setSelectedCategoryKey(null)
    setNewPost(prev => ({ ...prev, category: "" }))
  }, [])

  // PostCardDisplay 컴포넌트
  const PostCardDisplay = ({ post }: { post: Post }) => {
    const categoryInfo = combinedCategories.find(c => c.key === post.category)
    if (!categoryInfo) return null

    const CategoryIconRender = categoryInfo.icon || FileText

    return (
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                    style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                    className="font-normal"
                >
                  <CategoryIconRender className="h-3 w-3 mr-1" />
                  {categoryInfo.label}
                </Badge>
                {post.status === "draft" && (
                    <Badge variant="outline" className="text-gray-500 border-gray-300">
                      임시저장
                    </Badge>
                )}
              </div>
              <span className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            </div>
          </CardHeader>

          <CardContent className="pb-3">
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{post.content}</p>

            {post.image && (
                <div className="mb-3">
                  <img
                      src={post.image}
                      alt="Post image"
                      className="mx-auto max-h-48 object-contain rounded-md"
                  />
                </div>
            )}

            <div className="flex flex-wrap gap-1 mb-3">
              {post.hashtags.slice(0, 3).map((tag, index) => (
                  <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20"
                  >
                    {tag}
                  </Badge>
              ))}
            </div>
          </CardContent>

          <CardFooter className="pt-3 pb-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                {post.status === "published" && (
                    <>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likes}
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comments}
                      </div>
                    </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-gray-600 hover:text-[#6366f1] hover:bg-[#6366f1]/10"
                    onClick={() => handleEditPost(post)}
                >
                  수정
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-gray-600 hover:text-[#6366f1] hover:bg-[#6366f1]/10"
                    onClick={() => handleToggleStatus(post)}
                >
                  {post.status === "draft" ? "발행하기" : "임시저장"}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-gray-600 hover:text-red-500 hover:bg-red-50"
                    onClick={() => handleDeletePost(post)}
                >
                  삭제
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
    )
  }

  return (
      <SideLayout>
        <div className="flex-1 min-h-screen bg-green-50 pl-6">
          <div className="px-6 py-8 w-full max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="mb-6 pt-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
                <FileText className="mr-2 h-6 w-6" />
                글 작성하기
              </h1>
              <p className="text-gray-500">게시글을 작성하고 관리하세요.</p>
            </div>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "write" | "drafts" | "published")}
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="write" className="flex items-center">
                  <PenSquare className="h-4 w-4 mr-2" />
                  글쓰기 {editingPost ? "(수정중)" : ""}
                </TabsTrigger>
                <TabsTrigger value="drafts" className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  임시저장 ({drafts.length})
                </TabsTrigger>
                <TabsTrigger value="published" className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  발행됨 ({published.length})
                </TabsTrigger>
              </TabsList>

              {/* Write Tab */}
              <TabsContent value="write" className="space-y-6 pb-20">
                {!showPreview ? (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold">
                            {editingPost ? "게시글 수정하기" : "새 게시글 작성하기"}
                          </h2>
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowPreview(true)}
                              disabled={!newPost.content || !newPost.category}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            미리보기
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* 카테고리 선택 */}
                        <div className="space-y-2">
                          <label htmlFor="postCategory" className="text-sm font-medium">
                            카테고리
                          </label>
                          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={popoverOpen}
                                  className="w-full justify-between pr-3"
                              >
                                {displayCategoryText}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                              <div className="p-4 space-y-4">
                                <div className="flex p-1 rounded-md bg-gray-100 mb-2">
                                  <Button
                                      variant={categoryType === "job" ? "default" : "ghost"}
                                      className="flex-1 justify-center py-2 text-sm font-medium rounded-md"
                                      onClick={() => handleCategoryTypeChange("job")}
                                  >
                                    직무별
                                  </Button>
                                  <Button
                                      variant={categoryType === "topic" ? "default" : "ghost"}
                                      className="flex-1 justify-center py-2 text-sm font-medium rounded-md"
                                      onClick={() => handleCategoryTypeChange("topic")}
                                  >
                                    주제별
                                  </Button>
                                </div>

                                <ScrollArea className="h-[200px]">
                                  <Command>
                                    <CommandGroup>
                                      {visibleCategories.map((category) => {
                                        const CategoryIcon = category.icon
                                        const isSelected = selectedCategoryKey === category.key
                                        return (
                                            <CommandItem
                                                key={category.key}
                                                value={category.label}
                                                onSelect={() => handleCategorySelect(category)}
                                                className="flex items-center justify-between cursor-pointer py-2 px-3 text-sm hover:bg-violet-100 focus:bg-violet-100"
                                            >
                                              <div className="flex items-center gap-2">
                                                <CategoryIcon
                                                    className="h-4 w-4"
                                                    style={{ color: category.color }}
                                                />
                                                {category.label}
                                              </div>
                                              {isSelected && (
                                                  <Check className="ml-auto h-4 w-4 text-[#5B21B6]" />
                                              )}
                                            </CommandItem>
                                        )
                                      })}
                                    </CommandGroup>
                                  </Command>
                                </ScrollArea>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* 내용 입력 */}
                        <div className="space-y-2">
                          <label htmlFor="postMainContent" className="text-sm font-medium">
                            내용
                          </label>
                          <Textarea
                              id="postMainContent"
                              placeholder="게시글 내용을 입력하세요..."
                              value={newPost.content}
                              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                              className="min-h-[200px]"
                          />
                        </div>

                        {/* 해시태그 입력 */}
                        <div className="space-y-2">
                          <label htmlFor="postHashtags" className="text-sm font-medium">
                            해시태그
                          </label>
                          <div className="flex items-center">
                            <Hash className="h-4 w-4 mr-2 text-gray-400" />
                            <Input
                                id="postHashtags"
                                placeholder="해시태그 입력 (쉼표로 구분)"
                                value={newPost.hashtags}
                                onChange={(e) => setNewPost(prev => ({ ...prev, hashtags: e.target.value }))}
                            />
                          </div>
                          <p className="text-xs text-gray-500">예: #취업팁, #면접준비, #포트폴리오</p>
                        </div>

                        {/* 이미지 업로드 */}
                        <div className="space-y-2">
                          <div
                              className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={handleImageUpload}
                          >
                            {newPost.image ? (
                                <div className="relative">
                                  <img
                                      src={newPost.image}
                                      alt="Uploaded preview"
                                      className="mx-auto max-h-48 object-contain rounded-md"
                                  />
                                  <Button
                                      variant="outline"
                                      size="icon"
                                      className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-white"
                                      onClick={() => setNewPost(prev => ({ ...prev, image: null }))}
                                      disabled={isUploading}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                            ) : (
                                <div>
                                  <ImageIcon className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                  <p className="text-sm text-gray-500">
                                    이미지를 드래그하거나 클릭하여 업로드하세요
                                  </p>
                                  <input
                                      type="file"
                                      accept="image/*"
                                      ref={fileInputRef}
                                      onChange={handleImageUpload}
                                      className="hidden"
                                  />
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => fileInputRef.current?.click()}
                                      disabled={isUploading}
                                  >
                                    {isUploading ? "업로드 중..." : "이미지 선택"}
                                  </Button>
                                </div>
                            )}
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="flex items-center justify-between w-full">
                        <Button variant="outline" onClick={resetForm}>
                          {editingPost ? "수정 취소" : "새로 작성"}
                        </Button>
                        <div className="space-x-2">
                          <Button
                              variant="outline"
                              onClick={() => handleSavePost("draft")}
                              disabled={!newPost.content || !newPost.category}
                          >
                            임시저장
                          </Button>
                          <Button
                              onClick={() => handleSavePost("published")}
                              disabled={!newPost.content || !newPost.category}
                              className="bg-[#6366f1] hover:bg-[#6366f1]/90"
                          >
                            {editingPost ? "수정 완료" : "발행하기"}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                ) : (
                    // 미리보기 모드는 기존과 동일하게 유지
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">미리보기</h2>
                        <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                          <PenSquare className="h-4 w-4 mr-2" />
                          편집으로 돌아가기
                        </Button>
                      </div>
                      {/* 미리보기 내용... (기존 코드와 동일) */}
                    </div>
                )}
              </TabsContent>

              {/* Drafts Tab */}
              <TabsContent value="drafts" className="pb-20">
                {drafts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {drafts.map((post) => (
                          <PostCardDisplay key={post.id} post={post} />
                      ))}
                    </div>
                ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>임시저장된 게시글이 없습니다</AlertTitle>
                      <AlertDescription>새 게시글을 작성하고 임시저장해보세요.</AlertDescription>
                    </Alert>
                )}
              </TabsContent>

              {/* Published Tab */}
              <TabsContent value="published" className="pb-20">
                {published.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {published.map((post) => (
                          <PostCardDisplay key={post.id} post={post} />
                      ))}
                    </div>
                ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>발행된 게시글이 없습니다</AlertTitle>
                      <AlertDescription>새 게시글을 작성하고 발행해보세요.</AlertDescription>
                    </Alert>
                )}
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