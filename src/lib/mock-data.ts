// 백엔드 서버 없이 테스트할 수 있는 목 데이터

export interface MockPost {
  id: number
  author: { id: number; name: string; avatar: string; title: string; isFollowing?: boolean }
  title: string
  content: string
  imageUrl?: string
  hashtags: string[]
  likes: number
  comments: number
  timeAgo: string
  jobCategory?: string
  topicCategory?: string
  likedByMe?: boolean
  commentsList?: any[]
}

export interface MockProfile {
  id: number
  displayName: string
  bio: string
  jobTitle: string
  company: string
  location: string
  profileImageUrl: string
  coverImageUrl?: string
  postsCount: number
  followersCount: number
  followingCount: number
  isPublic: boolean
  allowFollow: boolean
}

// 목 게시글 데이터
export const mockPosts: MockPost[] = [
  {
    id: 1,
    author: {
      id: 101,
      name: "김개발",
      avatar: "/placeholder.svg?height=40&width=40",
      title: "프론트엔드 개발자",
      isFollowing: false
    },
    title: "React 18의 새로운 기능들",
    content: "React 18에서 새롭게 추가된 기능들을 정리해봤습니다.\n\n1. Concurrent Features\n2. Automatic Batching\n3. Suspense 개선\n\n특히 Concurrent Features는 사용자 경험을 크게 개선해줍니다. 렌더링 과정에서 우선순위를 정해서 중요한 업데이트를 먼저 처리할 수 있게 되었어요.",
    hashtags: ["#React", "#프론트엔드", "#JavaScript", "#개발팁"],
    likes: 24,
    comments: 8,
    timeAgo: "2시간 전",
    jobCategory: "dev",
    likedByMe: false,
    commentsList: []
  },
  {
    id: 2,
    author: {
      id: 102,
      name: "박디자이너",
      avatar: "/placeholder.svg?height=40&width=40",
      title: "UI/UX 디자이너",
      isFollowing: true
    },
    title: "사용자 중심 디자인 원칙",
    content: "좋은 UI/UX 디자인을 위한 핵심 원칙들을 공유합니다.\n\n• 사용자의 목표를 우선시하기\n• 일관성 있는 디자인 시스템 구축\n• 접근성 고려하기\n• 피드백과 개선\n\n실제 프로젝트에서 이런 원칙들을 어떻게 적용했는지도 함께 설명드려요.",
    hashtags: ["#UX디자인", "#UI디자인", "#사용자경험", "#디자인팁"],
    likes: 31,
    comments: 12,
    timeAgo: "4시간 전",
    jobCategory: "design",
    likedByMe: true,
    commentsList: []
  },
  {
    id: 3,
    author: {
      id: 103,
      name: "이취준생",
      avatar: "/placeholder.svg?height=40&width=40",
      title: "취업준비생",
      isFollowing: false
    },
    title: "신입 개발자 포트폴리오 후기",
    content: "드디어 첫 직장을 구했습니다! 🎉\n\n포트폴리오 준비하면서 배운 것들을 정리해봤어요:\n\n1. 기술 스택보다는 문제 해결 과정 보여주기\n2. 실제 사용할 수 있는 서비스 만들기\n3. 코드 품질과 문서화에 신경쓰기\n\n혹시 궁금한 점 있으시면 댓글로 물어보세요!",
    hashtags: ["#취업후기", "#포트폴리오", "#신입개발자", "#취업팁"],
    likes: 47,
    comments: 23,
    timeAgo: "6시간 전",
    topicCategory: "job-prep",
    likedByMe: false,
    commentsList: []
  },
  {
    id: 4,
    author: {
      id: 104,
      name: "최마케터",
      avatar: "/placeholder.svg?height=40&width=40",
      title: "디지털 마케터",
      isFollowing: false
    },
    title: "소셜미디어 마케팅 트렌드 2024",
    content: "올해 소셜미디어 마케팅에서 주목해야 할 트렌드들입니다.\n\n📱 숏폼 콘텐츠의 지속적인 성장\n🤖 AI 활용한 개인화 마케팅\n💬 커뮤니티 기반 마케팅\n🎯 인플루언서 마이크로 타겟팅\n\n각 플랫폼별 전략도 함께 공유드려요.",
    hashtags: ["#마케팅", "#소셜미디어", "#트렌드", "#디지털마케팅"],
    likes: 19,
    comments: 6,
    timeAgo: "8시간 전",
    jobCategory: "marketing",
    likedByMe: false,
    commentsList: []
  },
  {
    id: 5,
    author: {
      id: 105,
      name: "정일상러",
      avatar: "/placeholder.svg?height=40&width=40",
      title: "회사원",
      isFollowing: false
    },
    title: "재택근무 3년차 솔직 후기",
    content: "재택근무를 시작한 지 벌써 3년이 되었네요.\n\n좋은 점:\n✅ 출퇴근 시간 절약\n✅ 집중도 향상\n✅ 워라밸 개선\n\n어려운 점:\n❌ 소통의 어려움\n❌ 집중력 관리\n❌ 사회적 고립감\n\n나름의 노하우도 생겼는데, 궁금하시면 공유해드릴게요!",
    hashtags: ["#재택근무", "#워라밸", "#일상공유", "#직장생활"],
    likes: 33,
    comments: 15,
    timeAgo: "1일 전",
    topicCategory: "daily",
    likedByMe: true,
    commentsList: []
  }
];

// 목 프로필 데이터
export const mockProfile: MockProfile = {
  id: 1,
  displayName: "테스트 사용자",
  bio: "안녕하세요! 커뮤니티를 테스트하고 있는 사용자입니다.",
  jobTitle: "프론트엔드 개발자",
  company: "테스트 회사",
  location: "서울",
  profileImageUrl: "/placeholder.svg?height=96&width=96",
  coverImageUrl: "",
  postsCount: 12,
  followersCount: 87,
  followingCount: 43,
  isPublic: true,
  allowFollow: true
};

// 개발 모드 확인 함수
export const isDevelopmentMode = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// 백엔드 서버 연결 상태 확인 함수
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:8080/api/health', {
      method: 'GET',
      timeout: 3000 as any
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};
