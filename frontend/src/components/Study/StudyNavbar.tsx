"use client"
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// TODO should render new Components on the same page and not new Links

const StudyNavbar = () => {
  const router = useRouter();

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-200">
      <div className="flex gap-4">
        
      <button onClick={() => router.push('/writer')} className={`text-sm font-medium ${router.pathname === '/upload' ? 'text-blue-500' : 'text-gray-700'}`}>
          Writer
        </button>

        <button onClick={() => router.push('/pdfviewer')} className={`text-sm font-medium ${router.pathname === '/study' ? 'text-blue-500' : 'text-gray-700'}`}>
          View PDF
        </button>
        <button onClick={() => router.push('/mcqtest')} className={`text-sm font-medium ${router.pathname === '/chat' ? 'text-blue-500' : 'text-gray-700'}`}>
          Test
        </button>
        <button onClick={() => router.push('/scipapers')} className={`text-sm font-medium ${router.pathname === '/upload' ? 'text-blue-500' : 'text-gray-700'}`}>
          Science Papers
        </button>
      </div>
    </nav>
  );
};

export default StudyNavbar;
