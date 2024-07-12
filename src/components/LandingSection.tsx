import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'

const LandingSection = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-slate-400 to-primary">
      <div className="container py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            超級待辦事項應用
          </h1>
          <p className="text-xl text-white">
            輕鬆管理您的任務,提高工作效率
          </p>
        </header>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            立即開始
          </h2>
          <div className="space-y-4">
            <Link href="/auth" passHref>
              <Button className="w-full">
                免費註冊
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">簡單易用</h3>
            <p className="text-gray-600">直觀的界面,讓您輕鬆開始使用</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">隨時隨地</h3>
            <p className="text-gray-600">在任何設備上訪問您的待辦事項</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">協作功能</h3>
            <p className="text-gray-600">與團隊成員輕鬆共享和協作</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingSection
