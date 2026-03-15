"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div className="border-b bg-white">
      <div className="max-w-5xl mx-auto flex justify-between p-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Q&A Platform System
        </Link>

        <Link href="/ask" className="bg-blue-500 text-white px-4 py-2 rounded">
          Ask Question
        </Link>
      </div>
    </div>
  );
}
