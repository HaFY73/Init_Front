"use client"

import { useState } from "react"

export default function TestImagePage() {
  const [testUrl, setTestUrl] = useState("http://localhost:8080/uploads/images/2025/07/28/b998983f-ca73-4606-a4c9-af04fdd3e298.png")
  const [testResult, setTestResult] = useState<string>("")

  const testImageLoad = async () => {
    setTestResult("테스트 중...")
    
    try {
      // 1. fetch로 테스트
      console.log("🔄 fetch로 이미지 테스트:", testUrl)
      const response = await fetch(testUrl, { method: 'HEAD' })
      console.log("📡 fetch 응답:", response.status, response.statusText)
      
      if (response.ok) {
        setTestResult(`✅ fetch 성공: ${response.status} ${response.statusText}`)
      } else {
        setTestResult(`❌ fetch 실패: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error("❌ fetch 에러:", error)
      setTestResult(`❌ fetch 에러: ${error}`)
    }
  }

  const testWithImage = () => {
    setTestResult("이미지 로딩 테스트 중...")
    
    const img = new Image()
    img.onload = () => {
      console.log("✅ Image 객체 로딩 성공")
      setTestResult("✅ Image 객체 로딩 성공")
    }
    img.onerror = (error) => {
      console.error("❌ Image 객체 로딩 실패:", error)
      setTestResult("❌ Image 객체 로딩 실패")
    }
    img.src = testUrl
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">이미지 로딩 테스트</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">테스트할 이미지 URL:</label>
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={testImageLoad}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Fetch로 테스트
          </button>
          
          <button
            onClick={testWithImage}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Image 객체로 테스트
          </button>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <strong>테스트 결과:</strong> {testResult}
        </div>

        <div className="border p-4 rounded">
          <h3 className="font-bold mb-2">브라우저에서 직접 이미지 로딩 테스트:</h3>
          <img 
            src={testUrl} 
            alt="테스트 이미지"
            className="max-w-xs border"
            onLoad={() => console.log("✅ 브라우저 img 태그 로딩 성공")}
            onError={() => console.log("❌ 브라우저 img 태그 로딩 실패")}
          />
        </div>

        <div className="bg-yellow-50 p-4 rounded">
          <h3 className="font-bold mb-2">수동 테스트:</h3>
          <p>1. 새 탭에서 직접 URL 접근: 
            <a 
              href={testUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 underline ml-2"
            >
              {testUrl}
            </a>
          </p>
          <p className="mt-2">2. 브라우저 개발자 도구 → Network 탭에서 요청 상태 확인</p>
          <p className="mt-2">3. Console 탭에서 CORS 에러 또는 기타 에러 메시지 확인</p>
        </div>
      </div>
    </div>
  )
}