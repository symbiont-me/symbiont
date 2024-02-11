"use client";
import Markdown from "marked-react";

const test = `# Test \n 
1. some text \n 2. some text \n 3. some text`;
export default function Dashboard() {
  return (
    <>
      <Markdown gfm={true} breaks={true} value={test} />
    </>
  );
}
