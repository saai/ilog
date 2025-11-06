import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            内容聚合
            <span className="text-primary-600"> 精选站</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            汇聚YouTube、哔哩哔哩、微信公众号、简书等平台的最新优质内容。
            一站式获取多平台精彩内容，发现更多有趣的知识和故事。
          </p>
          
          {/* 最新信息源展示 */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">最新更新</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* YouTube 最新 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">YouTube</h3>
                  <p className="text-sm text-gray-600">最新视频更新</p>
                </div>
              </div>
              
              {/* 哔哩哔哩 最新 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.267.573-.4.92-.4.347 0 .653.133.92.4L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.267.573-.4.92-.4.347 0 .662.134.929.4.267.267.4.573.4.92 0 .347-.133.653-.4.92zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 10.107c.373 0 .684.124.934.374.25.25.383.569.4.96v1.173c-.017.391-.15.71-.4.96-.25.25-.561.374-.934.374s-.684-.125-.934-.375c-.25-.25-.383-.569-.4-.96v-1.173c.017-.391.15-.71.4-.96.25-.25.561-.374.934-.374zm8 0c.373 0 .684.124.934.374.25.25.383.569.4.96v1.173c-.017.391-.15.71-.4.96-.25.25-.561.374-.934.374s-.684-.125-.934-.375c-.25-.25-.383-.569-.4-.96v-1.173c.017-.391.15-.71.4-.96.25-.25.561-.374.934-.374z"/>
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">哔哩哔哩</h3>
                  <p className="text-sm text-gray-600">最新视频更新</p>
                </div>
              </div>
              
              {/* 微信公众号 最新 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 4.882-1.932 7.621-.116-.302-3.618-3.58-6.348-7.57-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.427-2.687 3.72-2.378 6.21.376 3.03 2.803 5.35 5.757 5.35.826 0 1.622-.15 2.362-.423a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.324-1.233a.588.588 0 0 1 .177-.554C22.33 16.22 23.5 14.44 23.5 12.5c0-2.829-2.35-5.13-5.562-5.642zm-2.903 2.75c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm5.813 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">微信公众号</h3>
                  <p className="text-sm text-gray-600">最新文章更新</p>
                </div>
              </div>
              
              {/* 简书 最新 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">简书</h3>
                  <p className="text-sm text-gray-600">最新文章更新</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog" className="btn-primary">
              查看所有内容
            </Link>
            <Link href="/about" className="btn-secondary">
              了解更多
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
} 