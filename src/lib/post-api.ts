// Post API 모듈

// 🔥 하드코딩된 API URL
const API_BASE_URL = "http://localhost:8080/api"

// 인증 헤더 생성
const getAuthHeaders = () => {
  // 여러 저장소에서 토큰 찾기 (useCommunityProfile.ts와 동일)
  const token = localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken');

  const userId = localStorage.getItem('userId');

  console.log('🔍 인증 정보 확인:', {
    hasToken: !!token,
    hasUserId: !!userId,
    tokenLength: token?.length || 0
  });

  // 토큰이 없거나 유효하지 않은 경우
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    console.error('❌ 유효한 인증 토큰이 없습니다.');
    throw new Error('로그인이 필요합니다.');
  }

  // 사용자 ID도 확인
  if (!userId || userId === 'undefined' || userId === 'null') {
    console.error('❌ 사용자 ID가 없습니다.');
    throw new Error('로그인 정보가 불완전합니다.');
  }

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

// 게시글 생성 요청 타입
export interface CreatePostData {
  content: string
  imageUrl?: string | null
  category?: string
  hashtags?: string[]
  status: "DRAFT" | "PUBLISHED"
  author: { id: number }
}

// 게시글 응답 타입
export interface PostResponse {
  id: number
  content: string
  imageUrl?: string
  jobCategory?: string
  topicCategory?: string
  status: string
  likesCount: number
  commentsCount: number
  bookmarksCount: number
  createdAt: string
  updatedAt: string
  author: {
    id: number
    name: string
    avatar?: string
    isFollowing?: boolean
  }
  hashtags: string[]
  likedByMe: boolean
  bookmarkedByMe: boolean
  timeAgo: string
}

// API 응답 래퍼 타입
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

/**
 * 모든 게시글 조회
 */
export async function getPosts(page: number = 0, size: number = 20): Promise<ApiResponse<PostResponse[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts?page=${page}&size=${size}`, {
      method: "GET",
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`게시글 조회에 실패했습니다: ${response.status}`)
    }

    const result: ApiResponse<{ content: PostResponse[] }> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.message || "게시글 조회에 실패했습니다")
    }

    return {
      success: true,
      data: result.data.content
    }

  } catch (error) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "알 수 없는 오류"
    }
  }
}

/**
 * 팔로잉한 사용자의 게시글 조회
 */
export async function getFollowingPosts(userId: number, page: number = 0, size: number = 20): Promise<ApiResponse<PostResponse[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/following/${userId}?page=${page}&size=${size}`, {
      method: "GET",
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`팔로잉 게시글 조회에 실패했습니다: ${response.status}`)
    }

    const result: ApiResponse<{ content: PostResponse[] }> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.message || "팔로잉 게시글 조회에 실패했습니다")
    }

    return {
      success: true,
      data: result.data.content
    }

  } catch (error) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "알 수 없는 오류"
    }
  }
}

/**
 * 카테고리별 게시글 조회
 */
export async function getPostsByCategory(category: string, page: number = 0, size: number = 20): Promise<ApiResponse<PostResponse[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/category/${category}?page=${page}&size=${size}`, {
      method: "GET",
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`카테고리별 게시글 조회에 실패했습니다: ${response.status}`)
    }

    const result: ApiResponse<{ content: PostResponse[] }> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.message || "카테고리별 게시글 조회에 실패했습니다")
    }

    return {
      success: true,
      data: result.data.content
    }

  } catch (error) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "알 수 없는 오류"
    }
  }
}

/**
 * 게시글 검색
 */
export async function searchPosts(query: string, page: number = 0, size: number = 20): Promise<ApiResponse<PostResponse[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
      method: "GET",
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`게시글 검색에 실패했습니다: ${response.status}`)
    }

    const result: ApiResponse<{ content: PostResponse[] }> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.message || "게시글 검색에 실패했습니다")
    }

    return {
      success: true,
      data: result.data.content
    }

  } catch (error) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "알 수 없는 오류"
    }
  }
}

/**
 * 좋아요 토글
 */
export async function toggleLike(postId: number, userId: number): Promise<ApiResponse<{ isLiked: boolean; likesCount: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    })

    if (!response.ok) {
      throw new Error(`좋아요 처리에 실패했습니다: ${response.status}`)
    }

    const result: ApiResponse<{ isLiked: boolean; likesCount: number }> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.message || "좋아요 처리에 실패했습니다")
    }

    return result

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "알 수 없는 오류"
    }
  }
}

/**
 * 댓글 추가
 */
export async function addComment(postId: number, userId: number, content: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, content })
    })

    if (!response.ok) {
      throw new Error(`댓글 추가에 실패했습니다: ${response.status}`)
    }

    const result: ApiResponse<any> = await response.json()

    if (!result.success) {
      throw new Error(result.message || "댓글 추가에 실패했습니다")
    }

    return result

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "알 수 없는 오류"
    }
  }
}

/**
 * 팔로우 토글
 */
export async function toggleFollow(userId: number, targetUserId: number): Promise<ApiResponse<{ success: boolean; following: boolean }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/follows/toggle?followerId=${userId}&followingId=${targetUserId}`, {
      method: "POST",
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`팔로우 처리에 실패했습니다: ${response.status}`)
    }

    const result = await response.json()

    return {
      success: true,
      data: { success: result.success, following: result.following }
    }

  } catch (error) {
    return {
      success: false,
      data: { success: false, following: false },
      message: error instanceof Error ? error.message : "알 수 없는 오류"
    }
  }
}

/**
 * 팔로우 상태 확인
 */
export async function checkFollowStatus(userId: number, targetUserId: number): Promise<ApiResponse<{ isFollowing: boolean }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/follows/status?followerId=${userId}&followingId=${targetUserId}`, {
      method: "GET",
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`팔로우 상태 확인에 실패했습니다: ${response.status}`)
    }

    const result = await response.json()

    return {
      success: true,
      data: { isFollowing: result.data || result.isFollowing || false }  // 🔥 result.data 추가
    }
  } catch (error) {
    return {
      success: false,
      data: { isFollowing: false },
      message: error instanceof Error ? error.message : "알 수 없는 오류"
    }
  }
}

/**
 * 팔로잉 목록 조회
 */
export async function getFollowingList(userId: number): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/follows/following?userId=${userId}`, {
      method: "GET",
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`팔로잉 목록 조회에 실패했습니다: ${response.status}`)
    }

    const result = await response.json()

    return {
      success: true,
      data: result.data?.content || []
    }

  } catch (error) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "알 수 없는 오류"
    }
  }
}

/**
 * 게시글 생성
 */
export async function createPost(postData: CreatePostData): Promise<PostResponse> {
  // 카테고리를 직무/주제로 분류
  const isJobCategory = [
    "management", "design", "dev", "marketing", "sales",
    "education", "operations", "logistics", "public", "special"
  ].includes(postData.category || "")

  const requestData = {
    content: postData.content,
    imageUrl: postData.imageUrl || null,
    jobCategory: isJobCategory ? postData.category : null,
    topicCategory: !isJobCategory ? postData.category : null,
    status: postData.status,
    hashtags: postData.hashtags || []
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts?authorId=${postData.author.id}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`게시글 생성에 실패했습니다: ${response.status}`)
    }

    const result: ApiResponse<PostResponse> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.message || "게시글 생성에 실패했습니다")
    }

    return result.data

  } catch (error) {
    throw error
  }
}

/**
 * 게시글 수정
 */
export async function updatePost(postId: number, authorId: number, postData: Partial<CreatePostData>): Promise<PostResponse> {
  // 카테고리를 직무/주제로 분류
  const isJobCategory = [
    "management", "design", "dev", "marketing", "sales",
    "education", "operations", "logistics", "public", "special"
  ].includes(postData.category || "")

  const requestData = {
    content: postData.content,
    imageUrl: postData.imageUrl || null,
    jobCategory: isJobCategory ? postData.category : null,
    topicCategory: !isJobCategory ? postData.category : null,
    status: postData.status,
    hashtags: postData.hashtags || []
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}?authorId=${authorId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`게시글 수정에 실패했습니다: ${response.status}`)
    }

    const result: ApiResponse<PostResponse> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.message || "게시글 수정에 실패했습니다")
    }

    return result.data

  } catch (error) {
    throw error
  }
}

/**
 * 게시글 삭제
 */
export async function deletePost(postId: number, authorId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}?authorId=${authorId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`게시글 삭제에 실패했습니다: ${response.status}`)
    }

  } catch (error) {
    throw error
  }
}

/**
 * 사용자의 발행된 게시글 조회
 */
export async function getUserPublishedPosts(userId: number, page: number = 0, size: number = 10): Promise<PostResponse[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/user/${userId}/published?page=${page}&size=${size}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`게시글 조회에 실패했습니다: ${response.status}`)
    }

    const result: ApiResponse<{ content: PostResponse[] }> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.message || "게시글 조회에 실패했습니다")
    }

    return result.data.content

  } catch (error) {
    throw error
  }
}

/**
 * 사용자의 임시저장 게시글 조회
 */
export async function getUserDraftPosts(userId: number, page: number = 0, size: number = 10): Promise<PostResponse[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/user/${userId}/drafts?page=${page}&size=${size}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`임시저장 게시글 조회에 실패했습니다: ${response.status}`)
    }

    const result: ApiResponse<{ content: PostResponse[] }> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.message || "임시저장 게시글 조회에 실패했습니다")
    }

    return result.data.content

  } catch (error) {
    throw error
  }
}