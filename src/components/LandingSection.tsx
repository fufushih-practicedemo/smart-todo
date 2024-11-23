'use client';
import React, { useEffect } from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { getUserInfo } from '@/actions/auth'
import { useRouter } from 'next/navigation'

const LandingSection = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getUserInfo();
      if (user) {
        router.push('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-slate-100">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Todo
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            專注於重要的事，讓生活更有條理
          </p>
          
          <div className="flex justify-center gap-4 mb-16">
            <Link href="/auth" passHref>
              <Button className="px-8 py-6 text-lg">
                開始使用
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">智能管理</h3>
              <p className="text-gray-600">智能分類您的任務，讓工作更有效率</p>
            </div>
            <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">簡約設計</h3>
              <p className="text-gray-600">清晰的界面設計，專注於重要的事情</p>
            </div>
            <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">雲端同步</h3>
              <p className="text-gray-600">隨時隨地存取您的待辦事項</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingSection
