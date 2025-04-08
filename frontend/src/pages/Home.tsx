import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Sparkles } from 'lucide-react';
import axios from "axios";
import { BACKEND_URL } from '../config';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      setIsLoading(true);
      navigate('/builder', { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="max-w-2xl w-full fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full blur-xl opacity-50"></div>
              <Wand2 className="w-16 h-16 text-white relative z-10" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 gradient-text">
            Website Builder AI
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Transform your ideas into reality with AI-powered website creation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-panel p-8">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your dream website... (e.g., 'A modern portfolio website with a dark theme and smooth animations')"
              className="w-full h-40 p-4 bg-gray-900/50 text-gray-100 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder-gray-500 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-teal-500 text-white py-4 px-6 rounded-lg font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Website Plan
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Powered by advanced AI technology</p>
        </div>
      </div>
    </div>
  );
}