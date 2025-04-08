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
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-gradient-to-b from-gray-900 to-gray-800 animate-fadeIn" 
           style={{ 
             backgroundImage: "url('https://images.unsplash.com/photo-1597361786755-cfb52e4d7f35?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
             animation: "fadeIn 1s ease-out"
           }}>
        <div className="max-w-2xl w-full" style={{ animation: "slideUp 0.8s ease-out 0.2s both" }}>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4" style={{ animation: "scaleIn 0.6s ease-out 0.6s both" }}>
              <Wand2 className="w-12 h-12 text-gray-400 hover:text-gray-300 transition-colors transform hover:scale-110 duration-300" />
            </div>
            <h1 className="text-4xl font-bold text-gray-200 mb-4" 
                style={{ animation: "slideUp 0.6s ease-out 0.8s both" }}>
              CodeDock
            </h1>
            <p className="text-lg text-gray-400"
               style={{ animation: "slideUp 0.6s ease-out 1s both" }}>
              Describe your dream website, and we'll help you build it step by step
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" style={{ animation: "slideUp 0.6s ease-out 1.2s both" }}>
            <div className="rounded-lg shadow-2xl p-6 backdrop-blur-sm bg-black/20 hover:bg-black/30 transition-all duration-300">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the website you want to build..."
                className="w-full h-32 p-4 bg-white/50 text-black border border-gray-800 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent resize-none placeholder-gray-600 transition-all duration-300 hover:border-gray-700"
              />
              <button
                type="submit"
                className="w-full mt-4 bg-black text-gray-200 py-3 px-6 rounded-lg font-medium hover:bg-gray-900 transition-all duration-300 border border-gray-700 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40"
              >
                Generate Website Plan
              </button>
            </div>
          </form>
          <footer className="mt-8 text-center text-white text-sm" style={{ animation: "fadeIn 1s ease-out 1.4s both" }}>
        <p>Made with ❤️ by Krishna</p>
      </footer>
        </div>
        
      </div>
    </>
  );
}