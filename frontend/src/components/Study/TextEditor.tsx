'use client'
import React, { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import {useAuth} from '@clerk/nextjs';

// TODO on render, fetch text from db and set value to that text

// NOTE this fixes the issue with document not being defined at initial render
// ref: https://github.com/zenoamaro/react-quill/issues/292
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-screen"><span className="loading loading-dots loading-md"></span></div>,
});



export default function TextEditor() {
  const auth = useAuth();
  const [value, setValue] = useState('');
  if (!auth) {
    return <div>auth is undefined</div>
  }
  
  useEffect(() => {
    const saveText = async () => {
      try {
        const response = await axios.post('/api/save-writer-text', {
          textId: 1,
          studyId: 1,
          userId: auth.userId,
          textContent: value
        });
        console.log(response.data);
      } catch (error) {
        console.error('Error saving text:', error);
      }
    };
    
    const timer = setTimeout(() => {
      saveText();
      console.log('text saved');
    }, 10000);

    return () => clearTimeout(timer);
  }, [value]);
    

   

  return (
    <div className='w-full h-screen'>
      <ReactQuill className='h-screen' theme="snow" value={value} onChange={setValue} />
    </div>
  );
}