import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// 게시글 API
export const getPosts = () => api.get("/posts")

export const getPostById = (id: number) => api.get(`/posts/${id}`);

export const createPost = (data: {
    title: string;
    content: string;
    category: string;
    hashtags: string[];
    imageUrl: string | null;
    status: "draft" | "published";
    author: { id: number }
}) => api.post("/posts", data);

export const updatePost = (id: number, data: any) => api.put(`/posts/${id}`, data);

export const deletePost = (id: number) => api.delete(`/posts/${id}`);

export const getPostsByCategory = (category: string) => api.get(`/posts/category/${category}`)

export const searchPosts = (query: string) => api.get(`/posts/search?q=${query}`)

export const getFollowingPosts = (userId: number) => api.get(`/posts/following/${userId}`)

// 좋아요 토글
export const toggleLike = (postId: number, userId: number) =>
    api.post(`/posts/${postId}/likes?userId=${userId}`);

// 🔥 수정된 팔로우 토글 - 올바른 엔드포인트 사용
export const toggleFollow = (followerId: number, followingId: number) =>
    api.post(`/follows/toggle?followerId=${followerId}&followingId=${followingId}`);

// 🔥 새로 추가된 팔로우 관련 API들
// 팔로잉 목록 조회
export const getFollowingList = (userId: number) => api.get(`/follows/${userId}`);

// 팔로워 목록 조회
export const getFollowersList = (userId: number) => api.get(`/follows/${userId}/followers`);

// 팔로우 상태 확인
export const checkFollowStatus = (followerId: number, followingId: number) =>
    api.get(`/follows/status?followerId=${followerId}&followingId=${followingId}`);

// CommunityProfile 기반 팔로우 토글
export const toggleFollowByProfile = (followerUserId: number, followingUserId: number) =>
    api.post(`/follows/profile`, { followerUserId, followingUserId });

// 댓글달기
export const addComment = (postId: number, userId: number, content: string) =>
    api.post(`/posts/${postId}/comments`, { userId, content })

// 🔥 이미지 URL 헬퍼 함수들
export const getImageUrl = (imagePath: string | undefined | null): string => {
    if (!imagePath) return '';

    // 이미 완전한 URL인 경우 그대로 반환
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // 백엔드 서버의 이미지 경로로 변환
    const baseUrl = 'http://localhost:8080';
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${baseUrl}${cleanPath}`;
};

// 기본 프로필 이미지 URL
export const getDefaultProfileImage = (): string => {
    return '/placeholder.svg?height=40&width=40';
};