import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Family Learning Hub
        </h1>
        <p className="text-center text-lg mb-4">
          Welcome to our Australian family learning platform
        </p>

        {/* 学习模块快捷入口 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mt-8 mb-12">
          <Link href="/vocabulary" className="group">
            <div className="p-6 border rounded-lg hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  📚
                </div>
                <h3 className="text-xl font-semibold group-hover:text-blue-600">
                  词汇学习
                </h3>
              </div>
              <p className="text-gray-600">
                系统化词汇学习，支持CSV导入、科学复习、多样化练习
              </p>
              <div className="mt-3 text-sm text-blue-600">
                包含16个澳洲本地化词汇 →
              </div>
            </div>
          </Link>

          <Link href="/exercises/english" className="group">
            <div className="p-6 border rounded-lg hover:border-green-500 hover:shadow-lg transition-all">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  📖
                </div>
                <h3 className="text-xl font-semibold group-hover:text-green-600">
                  英语练习
                </h3>
              </div>
              <p className="text-gray-600">阅读理解、语法练习、写作训练</p>
              <div className="mt-3 text-sm text-green-600">
                提升英语综合能力 →
              </div>
            </div>
          </Link>

          <Link href="/exercises/maths" className="group">
            <div className="p-6 border rounded-lg hover:border-purple-500 hover:shadow-lg transition-all">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  🔢
                </div>
                <h3 className="text-xl font-semibold group-hover:text-purple-600">
                  数学练习
                </h3>
              </div>
              <p className="text-gray-600">数值计算、几何图形、问题解决</p>
              <div className="mt-3 text-sm text-purple-600">培养数学思维 →</div>
            </div>
          </Link>

          <Link href="/homework" className="group">
            <div className="p-6 border rounded-lg hover:border-orange-500 hover:shadow-lg transition-all">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  📝
                </div>
                <h3 className="text-xl font-semibold group-hover:text-orange-600">
                  作业管理
                </h3>
              </div>
              <p className="text-gray-600">
                智能作业布置、提交、批改和分析系统
              </p>
              <div className="mt-3 text-sm text-orange-600">
                全流程作业管理 →
              </div>
            </div>
          </Link>

          <Link href="/ipad-unlock" className="group">
            <div className="p-6 border rounded-lg hover:border-indigo-500 hover:shadow-lg transition-all">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  📱
                </div>
                <h3 className="text-xl font-semibold group-hover:text-indigo-600">
                  iPad时间
                </h3>
              </div>
              <p className="text-gray-600">通过学习成绩解锁iPad使用时间</p>
              <div className="mt-3 text-sm text-indigo-600">激励学习系统 →</div>
            </div>
          </Link>

          <Link href="/mistakes" className="group">
            <div className="p-6 border rounded-lg hover:border-red-500 hover:shadow-lg transition-all">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  📖
                </div>
                <h3 className="text-xl font-semibold group-hover:text-red-600">
                  错题本
                </h3>
              </div>
              <p className="text-gray-600">收集和复习错题，提高学习效率</p>
              <div className="mt-3 text-sm text-red-600">学习反思工具 →</div>
            </div>
          </Link>
        </div>

        {/* 学生专区 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold mb-2 text-blue-800">
              August (Year 3, 8岁)
            </h2>
            <p className="text-blue-700 mb-4">
              基础词汇建立，培养学习兴趣和良好习惯
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>澳洲动物主题词汇</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>日常生活用语</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>基础数学概念</span>
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-xl font-semibold mb-2 text-green-800">
              Michael (Year 6, 11岁)
            </h2>
            <p className="text-green-700 mb-4">中级词汇扩展，学术能力提升</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>科学术语和概念</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>澳洲历史地理</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>学术写作能力</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
