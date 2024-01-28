'use client'
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// TODO autosave to db
export default function TextEditor() {
  const [value, setValue] = useState('');

  return (
  <div className='w-full'><ReactQuill theme="snow" value={value} onChange={setValue} /></div>);
}