// 🔥 개선된 post-api.ts - 백엔드 Post 엔티티 변경사항 반영

const API_BASE_URL = "http://localhost:8080/api"

// 인증 헤더 생성
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId');

  console.log('🔍 인증 정보 확인:', {
    hasToken: !!token,
    hasUserId: !!userId,
    tokenLength: token?.length || 0
  });

  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    console.error('❌ 유효한 인증 토큰이 없습니다.');
    throw new Error('로그인이 필요합니다.');
  }

  if (!userId || userId === 'undefined' || userId === 'null') {
    console.error('❌ 사용자 ID가 없습니다.');
    throw new Error('로그인 정보가 불완전합니다.');
  }

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

// 🔥 수정: 백엔드 Post 엔티티 변경사항 반영
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
    id: number          // CommunityProfile ID
    name: string
    avatar?: string
    isFollowing?: boolean
  }
  // 🔥 백엔드에서 User 직접 참조 추가
  user?: {
    id: number          // 실제 User ID
    username?: string
    email?: string
  }
  hashtags: string[]
  likedByMe: boolean
  bookmarkedByMe: boolean
  timeAgo: string
}

// 게시글 생성 요청 타입
export interface CreatePostData {
  content: string
  imageUrl?: string | null
  category?: string
  hashtags?: string[]
  status: "DRAFT" | "PUBLISHED"
  author: { id: number }  // User ID
}

// API 응답 래퍼 타입
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// 🔥 헬퍼 함수: User ID 유효성 검증
const ensureValidUserId = (userId: number, context: string): number => {
  if (!userId || userId <= 0) {
    throw new Error(`${context}: 유효하지 않은 사용자 ID입니다.`);
  }
  return userId;
}

// 🔥 헬퍼 함수: PostResponse에서 실제 User ID 추출
export const getActualUserId = (postResponse: PostResponse): number => {
  // 백엔드에서 User 직접 참조를 추가했으므로, user.id를 우선 사용
  return postResponse.user?.id || postResponse.author.id;
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
    console.error('❌ 게시글 조회 오류:', error);
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
    const validUserId = ensureValidUserId(userId, "팔로잉 게시글 조회");

    const response = await fetch(`${API_BASE_URL}/posts/following/${validUserId}?page=${page}&size=${size}`, {
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
    console.error('❌ 팔로잉 게시글 조회 오류:', error);
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
    console.error('❌ 카테고리별 게시글 조회 오류:', error);
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
    console.error('❌ 게시글 검색 오류:', error);
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
    const validUserId = ensureValidUserId(userId, "좋아요 토글");

    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId: validUserId })
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
    console.error('❌ 좋아요 토글 오류:', error);
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
    const validUserId = ensureValidUserId(userId, "댓글 추가");

    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId: validUserId, content })
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
    console.error('❌ 댓글 추가 오류:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "알 수 없는 오류"
    }
  }
}

/**
 * 🔥 수정: 팔로우 토글 - User ID 검증 강화
 */
export async function toggleFollow(userId: number, targetUserId: number): Promise<ApiResponse<{ success: boolean; following: boolean }>> {
  try {
    // User ID 유효성 검증
    const validUserId = ensureValidUserId(userId, "팔로우 토글");
    const validTargetUserId = ensureValidUserId(targetUserId, "팔로우 대상");

    console.log('🎯 팔로우 토글 API 호출:', {
      followerId: validUserId,
      followingId: validTargetUserId
    });

    const response = await fetch(`${API_BASE_URL}/follows/toggle?followerId=${validUserId}&followingId=${validTargetUserId}`, {
      method: "POST",
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 팔로우 API 에러 응답:', errorText);
      throw new Error(`팔로우 처리에 실패했습니다: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ 팔로우 토글 성공:', result);

    return {
      success: true,
      data: { success: result.success, following: result.following }
    }

  } catch (error) {
    console.error('❌ 팔로우 토글 에러:', error);
    return {
      success: false,
      data: { success: false, following: false },
      message: error instanceof Error ? error.message : "알 수 없는 오류"
    }
  }
}

/**
 * 🔥 수정: 팔로우 상태 확인 - User ID 검증 강화
 */
export async function checkFollowStatus(userId: number, targetUserId: number): Promise<ApiResponse<{ isFollowing: boolean }>> {
  try {
    const validUserId = ensureValidUserId(userId, "팔로우 상태 확인");
    const validTargetUserId = ensureValidUserId(targetUserId, "팔로우 상태 확인 대상");

    const response = await fetch(`${API_BASE_URL}/follows/status?followerId=${validUserId}&followingId=${validTargetUserId}`, {
      method: "GET",
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`팔로우 상태 확인에 실패했습니다: ${response.status}`)
    }

    const result = await response.json()

    return {
      success: true,
      data: { isFollowing: result.data?.isFollowing || result.isFollowing || false }
    }
  } catch (error) {
    console.warn(`⚠️ 팔로우 상태 확인 실패 (userId: ${userId}, targetUserId: ${targetUserId}):`, error);
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
    const validUserId = ensureValidUserId(userId, "팔로잉 목록 조회");

    const response = await fetch(`${API_BASE_URL}/follows/following?userId=${validUserId}`, {
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
    console.error('❌ 팔로잉 목록 조회 오류:', error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "알 수 없는 오류"
    }
  }
}

/**
 * 🔥 수정: 게시글 생성 - authorId를 User ID로 명확히 처리
 */
export async function createPost(postData: CreatePostData): Promise<PostResponse> {
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
    const validAuthorId = ensureValidUserId(postData.author.id, "게시글 생성");

    console.log('🔄 게시글 생성 요청:', {
      authorId: validAuthorId,
      data: requestData
    });

    // authorId는 User ID로 전달
    const response = await fetch(`${API_BASE_URL}/posts?authorId=${validAuthorId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ 게시글 생성 실패:', errorData);
      throw new Error(`게시글 생성에 실패했습니다: ${response.status}`)
    }

    const result: ApiResponse<PostResponse> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.message || "게시글 생성에 실패했습니다")
    }

    console.log('✅ 게시글 생성 성공:', result.data);
    return result.data

  } catch (error) {
    console.error('❌ 게시글 생성 에러:', error);
    throw error
  }
}

/**
 * 게시글 수정
 */
export async function updatePost(postId: number, authorId: number, postData: Partial<CreatePostData>): Promise<PostResponse> {
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
    const validAuthorId = ensureValidUserId(authorId, "게시글 수정");

    const response = await fetch(`${API_BASE_URL}/posts/${postId}?authorId=${validAuthorId}`, {
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
    console.error('❌ 게시글 수정 에러:', error);
    throw error
  }
}

/**
 * 게시글 삭제
 */
export async function deletePost(postId: number, authorId: number): Promise<void> {
  try {
    const validAuthorId = ensureValidUserId(authorId, "게시글 삭제");

    const response = await fetch(`${API_BASE_URL}/posts/${postId}?authorId=${validAuthorId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`게시글 삭제에 실패했습니다: ${response.status}`)
    }

  } catch (error) {
    console.error('❌ 게시글 삭제 에러:', error);
    throw error
  }
}

/**
 * 사용자의 발행된 게시글 조회
 */
export async function getUserPublishedPosts(userId: number, page: number = 0, size: number = 10): Promise<PostResponse[]> {
  try {
    const validUserId = ensureValidUserId(userId, "발행된 게시글 조회");

    const response = await fetch(`${API_BASE_URL}/posts/user/${validUserId}/published?page=${page}&size=${size}`, {
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
    console.error('❌ 발행된 게시글 조회 에러:', error);
    throw error
  }
}

/**
 * 사용자의 임시저장 게시글 조회
 */
export async function getUserDraftPosts(userId: number, page: number = 0, size: number = 10): Promise<PostResponse[]> {
  try {
    const validUserId = ensureValidUserId(userId, "임시저장 게시글 조회");

    const response = await fetch(`${API_BASE_URL}/posts/user/${validUserId}/drafts?page=${page}&size=${size}`, {
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
    console.error('❌ 임시저장 게시글 조회 에러:', error);
    throw error
  }
}