'use client'
import React, { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css';

// NOTE this fixes the issue with document not being defined at initial render
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});


export default function TextEditor() {
  const [value, setValue] = useState('');
// TODO implement autosave to db
  useEffect(() => {
  }, [value]);

  return (
    <div className='w-full h-screen'>
      <ReactQuill className='h-screen' theme="snow" value={value} onChange={setValue} />
    </div>
  );
}