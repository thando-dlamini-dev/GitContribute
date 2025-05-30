import React from 'react'
import { Github, Code, Users, TrendingUp, Star, GitBranch } from 'lucide-react'
import { motion } from 'framer-motion'

const HeroSection = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex flex-col lg:flex-row'>
      {/* Left Content Section */}
      <div className='w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 lg:py-0'>
        <div className='max-w-xl'>
          <h1 className='text-slate-800 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6'>
            Discover Open Source Projects That 
            <span className='text-purple-600'> Match Your Skills</span>
          </h1>
          <p className='text-slate-600 text-base sm:text-lg leading-relaxed mb-8'>
            GitContribute uses AI to match developers with open-source projects that fit their skills. 
            Get personalized recommendations, track your progress, and receive daily emails with new opportunities. 
            Our platform is designed to help you contribute and grow.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 sm:gap-6'>
            <button className='bg-purple-600 hover:bg-purple-700 transition-colors duration-200 text-white text-lg font-semibold px-8 py-3 rounded-full text-center shadow-lg hover:shadow-xl cursor-pointer'>
              Start Contributing Today
            </button>
            <button className='border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-colors duration-200 text-lg font-semibold px-8 py-3 rounded-full text-center cursor-pointer'>
              How It Works
            </button>
          </div>
        </div>
      </div>

      {/* Right Visual Section */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12'>
        <div className='relative w-full max-w-md'>
          {/* Main GitHub Card */}
          <div className='bg-white rounded-2xl shadow-2xl p-6 mb-4 border border-slate-200'>
            <div className='flex items-center gap-3 mb-4'>
              <Github className='w-8 h-8 text-slate-700' />
              <div>
                <h3 className='font-semibold text-slate-800'>awesome-react-ui</h3>
                <p className='text-sm text-slate-500'>React • TypeScript</p>
              </div>
            </div>
            <p className='text-slate-600 text-sm mb-4'>
              A collection of beautiful React components with TypeScript support
            </p>
            <div className='flex items-center gap-4 text-sm text-slate-500'>
              <div className='flex items-center gap-1'>
                <Star className='w-4 h-4' />
                <span>2.1k</span>
              </div>
              <div className='flex items-center gap-1'>
                <GitBranch className='w-4 h-4' />
                <span>156</span>
              </div>
            </div>
            <div className='mt-4 pt-4 border-t border-slate-100'>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full'>
                  95% Match
                </span>
                <span className='text-xs text-green-600'>Good First Issue</span>
              </div>
            </div>
          </div>

          {/* Floating Stats Cards */}
          <div className='absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-slate-200'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='w-5 h-5 text-green-500' />
              <div>
                <p className='text-xs text-slate-500'>Weekly Progress</p>
                <p className='font-semibold text-slate-800'>+3 PRs</p>
              </div>
            </div>
          </div>

          <div className='absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-slate-200'>
            <div className='flex items-center gap-2'>
              <Users className='w-5 h-5 text-blue-500' />
              <div>
                <p className='text-xs text-slate-500'>Contributors</p>
                <p className='font-semibold text-slate-800'>247</p>
              </div>
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div className='mt-6 flex flex-wrap gap-2 justify-center'>
            <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'>React</span>
            <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm'>Node.js</span>
            <span className='bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm'>TypeScript</span>
            <span className='bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm'>Python</span>
          </div>

          {/* AI Matching Indicator */}
          <div className='mt-6 text-center'>
            <div className='inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full'>
              <Code className='w-4 h-4 text-purple-600' />
              <span className='text-sm font-medium text-slate-700'>AI-Powered Matching</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection