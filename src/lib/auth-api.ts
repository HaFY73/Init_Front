// lib/auth-api.ts
const API_BASE_URL = 'http://localhost:8080/api';

export const authApi = {
    /**
     * 아이디 중복 확인
     * @param userId 확인할 아이디
     * @returns 중복이면 true, 사용 가능하면 false
     */
    checkUserIdDuplicate: async (userId: string): Promise<boolean> => {
        try {
            console.log('🔍 아이디 중복 확인 요청:', userId);
            const url = `${API_BASE_URL}/check-userid/${encodeURIComponent(userId)}`;
            console.log('🔗 최종 요청 URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 세션 유지를 위해 추가
            });

            console.log('📡 응답 상태:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ 서버 오류 응답:', errorText);

                if (response.status === 400) {
                    throw new Error(errorText || '잘못된 요청입니다.');
                }
                throw new Error(errorText || '아이디 중복 확인 중 오류가 발생했습니다.');
            }

            const result = await response.json();
            console.log('✅ 중복 확인 결과:', result);
            return result;
        } catch (error) {
            console.error('💥 아이디 중복 확인 실패:', error);
            // 네트워크 오류인지 확인
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                throw new Error('🚨 백엔드 서버(localhost:8080)에 연결할 수 없습니다.\n\n해결 방법:\n1. 백엔드 서버가 실행 중인지 확인\n2. ./gradlew bootRun 또는 ./mvnw spring-boot:run 실행\n3. http://localhost:8080 접속 가능한지 확인');
            }
            throw error;
        }
    },

    /**
     * 이메일 중복 확인
     * @param email 확인할 이메일
     * @returns 중복이면 true, 사용 가능하면 false
     */
    checkEmailDuplicate: async (email: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}/check-email/${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 세션 유지를 위해 추가
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorText = await response.text();
                    throw new Error(errorText || '잘못된 요청입니다.');
                }
                throw new Error('이메일 중복 확인 중 오류가 발생했습니다.');
            }

            return await response.json();
        } catch (error) {
            console.error('이메일 중복 확인 실패:', error);
            throw error;
        }
    },

    /**
     * 이메일 인증 코드 발송 (중복확인 포함)
     */
    sendEmailVerificationCode: async (email: string): Promise<string> => {
        try {
            const response = await fetch(`${API_BASE_URL}/send-email-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: 'include', // 세션 유지를 위해 필수
                body: `email=${encodeURIComponent(email)}`,
            });

            const result = await response.text();

            if (!response.ok) {
                throw new Error(result || '이메일 인증 코드 발송에 실패했습니다.');
            }

            return result;
        } catch (error) {
            console.error('이메일 인증 코드 발송 실패:', error);
            throw error;
        }
    },

    /**
     * 이메일 인증 코드 검증
     */
    verifyEmailCode: async (email: string, code: string): Promise<string> => {
        try {
            console.log('🔍 이메일 인증 코드 검증 시작:', { email, code });
            
            const response = await fetch(`${API_BASE_URL}/verify-email-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: 'include', // 세션 유지를 위해 필수
                body: `email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`,
            });

            console.log('📡 인증 코드 검증 응답:', response.status, response.statusText);
            
            const result = await response.text();
            console.log('📋 서버 응답 내용:', result);

            if (!response.ok) {
                console.error('❌ 인증 코드 검증 실패:', result);
                throw new Error(result || '이메일 인증에 실패했습니다.');
            }

            console.log('✅ 인증 코드 검증 성공');
            return result;
        } catch (error) {
            console.error('💥 이메일 인증 검증 실패:', error);
            throw error;
        }
    },

    /**
     * 회원가입
     */
    signup: async (signupData: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 세션 유지를 위해 추가
                body: JSON.stringify(signupData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '회원가입에 실패했습니다.');
            }

            return await response.text();
        } catch (error) {
            console.error('회원가입 실패:', error);
            throw error;
        }
    },

    /**
     * 로그인
     */
    login: async (loginData: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 세션 유지를 위해 추가
                body: JSON.stringify(loginData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '로그인에 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            console.error('로그인 실패:', error);
            throw error;
        }
    }
};