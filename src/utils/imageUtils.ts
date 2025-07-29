export const getImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) {
    return "/placeholder.svg?height=96&width=96"
  }

  // Base64 이미지인 경우
  if (imageUrl.startsWith('data:')) {
    return imageUrl
  }

  // 이미 완전한 URL인 경우
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // 상대 경로인 경우 서버 URL 추가
  if (imageUrl.startsWith('/')) {
    return `http://localhost:8080${imageUrl}`
  }

  // 기타 경우 서버 URL 추가
  return `http://localhost:8080/${imageUrl}`
}

// 이미지 로딩 테스트 함수
export const testImageLoad = async (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => {
      console.error('이미지 로딩 실패:', imageUrl)
      resolve(false)
    }
    img.src = imageUrl
    
    // 타임아웃 설정 (5초 후 실패로 처리)
    setTimeout(() => {
      if (img.complete === false) {
        console.error('이미지 로딩 타임아웃:', imageUrl)
        resolve(false)
      }
    }, 5000)
  })
}