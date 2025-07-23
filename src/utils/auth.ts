// utils/auth.ts
export const clearAllAuthData = () => {
    console.log('🚪 Starting complete logout process...');

    // 1. localStorage 완전 정리
    if (typeof window !== 'undefined') {
        const keysToRemove = [
            'userId', 'userName', 'userEmail', 'name', 'email',
            'token', 'refreshToken', 'authToken', 'accessToken',
            'loginTime', 'sessionId', 'userInfo'
        ];

        // 기존 키들 삭제
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🗑️ Removed localStorage: ${key}`);
        });

        // 혹시 모를 다른 키들도 확인
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (key.includes('user') || key.includes('auth') || key.includes('login')) {
                localStorage.removeItem(key);
                console.log(`🗑️ Removed additional localStorage: ${key}`);
            }
        });
    }

    // 2. sessionStorage 완전 정리
    if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.clear();
        console.log('🧹 Cleared all sessionStorage');
    }

    // 3. 모든 도메인과 경로에서 쿠키 삭제
    const cookiesToDelete = [
        'userId', 'userName', 'userEmail', 'name', 'email',
        'token', 'refreshToken', 'authToken', 'accessToken',
        'JSESSIONID', 'sessionId', 'next-auth.session-token',
        'next-auth.csrf-token', 'next-auth.pkce.code_verifier'
    ];

    // 여러 경로와 도메인에서 쿠키 삭제
    const paths = ['/', '/login', '/dashboard'];
    const domains = [window.location.hostname, 'localhost', '127.0.0.1'];

    cookiesToDelete.forEach(cookieName => {
        // 기본 삭제
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

        // 다양한 경로에서 삭제
        paths.forEach(path => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
        });

        // 다양한 도메인에서 삭제 (localhost 환경)
        domains.forEach(domain => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
        });

        console.log(`🍪 Deleted cookie: ${cookieName}`);
    });

    // 4. 혹시 남은 쿠키들 확인 및 삭제
    const allCookies = document.cookie.split(';');
    allCookies.forEach(cookie => {
        const [name] = cookie.split('=');
        const cleanName = name.trim();
        if (cleanName && (cleanName.includes('user') || cleanName.includes('auth') || cleanName.includes('login'))) {
            document.cookie = `${cleanName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            console.log(`🍪 Deleted additional cookie: ${cleanName}`);
        }
    });

    console.log('✅ Complete logout data clearing finished');

    // 5. 현재 남은 데이터 확인 (디버깅용)
    console.log('🔍 Remaining data check:');
    console.log('localStorage keys:', Object.keys(localStorage));
    console.log('document.cookie:', document.cookie);
};

// 로그아웃 후 리다이렉트
export const performLogout = () => {
    clearAllAuthData();

    // 강제 페이지 이동
    window.location.href = '/login';

    // 추가 보장: 히스토리 교체
    if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '/login');
    }
};

//커뮤니티 로그인 세션 - 실제 로그인된 사용자만 사용
export const getCurrentUserId = (): number | null => {
    if (typeof window !== "undefined") {
        const stored = localStorage.getItem("userId");
        return stored ? parseInt(stored, 10) : null;
    }
    return null;
};