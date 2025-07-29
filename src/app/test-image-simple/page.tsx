"use client"

import { useState } from "react"

export default function TestImageSimplePage() {
  const [testUrls] = useState([
    "http://localhost:8080/uploads/images/2025/07/22/2e64909b-ad88-4f1e-9dbb-0ef7f8c880ab.png",
    "http://localhost:8080/uploads/images/2025/07/23/016d3890-f33e-432c-aefd-5f1fbdaed7bb.png",
    "http://localhost:8080/uploads/images/2025/07/24/51064e8d-dabb-4c7f-8813-fec5d6fec592.png",
    "http://localhost:8080/uploads/images/2025/07/28/a5cecee5-95b2-4087-ae15-8151b6aa525e.png" // 존재하지 않는 파일
  ])

  const [backendTest, setBackendTest] = useState<string>("")

  const testBackend = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/health")
      const data = await response.json()
      setBackendTest(`✅ 백엔드 연결 성공: ${data.message}`)
    } catch (error) {
      setBackendTest(`❌ 백엔드 연결 실패: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">간단한 이미지 테스트</h1>
      
      <div className="space-y-6">
        <div>
          <button 
            onClick={testBackend}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
          >
            백엔드 연결 테스트
          </button>
          <div className="p-4 bg-gray-100 rounded">
            {backendTest || "백엔드 테스트 버튼을 클릭하세요"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testUrls.map((url, index) => (
            <div key={index} className="border p-4 rounded">
              <h3 className="font-bold mb-2">테스트 #{index + 1}</h3>
              <p className="text-xs text-gray-600 mb-2 break-all">{url}</p>
              
              <div className="space-y-2">
                <div>
                  <strong>브라우저 img 태그:</strong>
                  <div className="mt-1">
                    <img 
                      src={url} 
                      alt={`테스트 이미지 ${index + 1}`}
                      className="w-24 h-24 object-cover border"
                      onLoad={() => console.log(`✅ 이미지 ${index + 1} 로딩 성공`)}
                      onError={() => console.log(`❌ 이미지 ${index + 1} 로딩 실패`)}
                    />
                  </div>
                </div>
                
                <div>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 underline text-sm"
                  >
                    새 탭에서 직접 열기
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 p-4 rounded">
          <h3 className="font-bold mb-2">테스트 결과 해석:</h3>
          <ul className="text-sm space-y-1">
            <li><strong>이미지가 보임:</strong> 백엔드 정적 리소스 설정 성공 ✅</li>
            <li><strong>일부만 보임:</strong> 해당 날짜 폴더에만 파일이 존재</li>
            <li><strong>전부 안 보임:</strong> 백엔드 설정 문제 또는 재시작 필요 ❌</li>
          </ul>
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-bold mb-2">브라우저 개발자 도구 확인:</h3>
          <ul className="text-sm space-y-1">
            <li>1. F12 → Network 탭</li>
            <li>2. 이미지 요청들의 상태 코드 확인 (200=성공, 404=파일없음, 500=서버오류)</li>
            <li>3. Console 탭에서 로딩 성공/실패 메시지 확인</li>
          </ul>
        </div>
      </div>
    </div>
  )
}