import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import axios from "axios";
import { BACKEND_URL } from '../config';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-gradient-to-b from-gray-900 to-gray-800" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1597361786755-cfb52e4d7f35?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Wand2 className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-200 mb-4">
            CodeDock 
          </h1>
          <p className="text-lg text-gray-400">
            Describe your dream website, and we'll help you build it step by step
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg shadow-2xl p-6 ">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the website you want to build..."
              className="w-full h-32 p-4 bg-white-900/80 text-gray-200 border border-gray-800 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent resize-none placeholder-gray-600"
            />
            <button
              type="submit"
              className="w-full mt-4 bg-black text-gray-200 py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors border border-gray-700"
            >
              Generate Website Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}