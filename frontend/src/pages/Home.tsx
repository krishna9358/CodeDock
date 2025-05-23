import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, FileText, Twitter, Linkedin, Mail, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  // Use wallet adapter
  const { publicKey } = useWallet();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
    }
  };

  // Ball animation around hexagon
  const [ballPosition, setBallPosition] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBallPosition(prev => (prev + 1) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Calculate ball position along hexagon path
  const getBallPosition = (angle: number) => {
    // Convert from degrees to radians
    const radian = (angle * Math.PI) / 180;
    
    // Hexagon parameters
    const hexRadius = 150; // Radius to points
    const centerX = 150;
    const centerY = 150;
    
    // Find which side of the hexagon we're on
    const sideAngle = Math.floor(angle / 60) % 6;
    const angleWithinSide = angle % 60;
    const percentAlongSide = angleWithinSide / 60;
    
    let x, y;
    
    // Calculate corners of the hexagon
    const corners = [];
    for (let i = 0; i < 6; i++) {
      const pointAngle = (i * 60 - 30) * Math.PI / 180;
      corners.push({
        x: centerX + hexRadius * Math.cos(pointAngle),
        y: centerY + hexRadius * Math.sin(pointAngle)
      });
    }
    
    // Interpolate between corners based on current angle
    const startCorner = corners[sideAngle];
    const endCorner = corners[(sideAngle + 1) % 6];
    
    x = startCorner.x + (endCorner.x - startCorner.x) * percentAlongSide;
    y = startCorner.y + (endCorner.y - startCorner.y) * percentAlongSide;
    
    return { x, y };
  };
  
  const ballPos = getBallPosition(ballPosition);

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
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-5px) rotate(1deg); }
            50% { transform: translateY(-10px) rotate(0deg); }
            75% { transform: translateY(-5px) rotate(-1deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
          @keyframes glowPulse {
            0%, 100% { filter: drop-shadow(0 0 5px rgba(0, 162, 255, 0.7)); }
            50% { filter: drop-shadow(0 0 25px rgba(0, 162, 255, 0.9)); }
          }
          @keyframes borderGlow {
            0%, 100% { border-color: rgba(78, 159, 255, 0.4); }
            50% { border-color: rgba(78, 159, 255, 0.8); }
          }
          @keyframes gradientRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .dark-space-bg {
            background-color: #010915;
            background-image: radial-gradient(circle at 50% 50%, #051937 0%, #010915 70%);
            position: relative;
            overflow: hidden;
          }
          
          .dark-space-bg::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%230a2d5e' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
            opacity: 0.4;
            z-index: 0;
          }
          
          .hexagon-wrapper {
            position: relative;
            width: 300px;
            height: 300px;
            animation: float 6s ease-in-out infinite;
            display: flex;
            justify-content: center;
            align-items: center;
            perspective: 1000px;
          }
          
          .hexagon-container {
            position: relative;
            width: 300px;
            height: 300px;
            transform-style: preserve-3d;
            transform: rotateX(15deg);
          }
          
          .hexagon-outer {
            position: absolute;
            top: 0;
            left: 0;
            width: 300px;
            height: 300px;
            clip-path: polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%);
            background: linear-gradient(45deg, rgba(23, 63, 95, 0.2), rgba(23, 63, 95, 0.1));
            border: 1px solid rgba(78, 159, 255, 0.2);
            animation: borderGlow 4s ease-in-out infinite;
            box-shadow: 0 0 30px rgba(0, 102, 255, 0.1);
          }
          
          .hexagon-middle {
            position: absolute;
            top: 15px;
            left: 15px;
            width: 270px;
            height: 270px;
            clip-path: polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%);
            background: linear-gradient(45deg, rgba(0, 102, 255, 0.05), rgba(111, 0, 255, 0.05));
            border: 1px solid rgba(78, 159, 255, 0.3);
            overflow: hidden;
          }
          
          .hexagon-middle::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: conic-gradient(from 0deg, transparent, rgba(0, 132, 255, 0.1), transparent, transparent);
            animation: gradientRotate 20s linear infinite;
          }
          
          .hexagon-inner {
            position: absolute;
            top: 45px;
            left: 45px;
            width: 210px;
            height: 210px;
            clip-path: polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%);
            background: linear-gradient(145deg, rgba(0, 60, 120, 0.4), rgba(21, 0, 80, 0.4));
            border: 1px solid rgba(78, 159, 255, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(5px);
          }
          
          .hexagon-core {
            width: 150px;
            height: 150px;
            clip-path: polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%);
            background: linear-gradient(145deg, #0078ff, #5516ff);
            box-shadow: 0 0 30px rgba(0, 120, 255, 0.7) inset;
            position: relative;
            animation: glowPulse 4s infinite;
            overflow: hidden;
          }
          
          .hexagon-core::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at center, rgba(255, 255, 255, 0.8), transparent 70%);
            opacity: 0.3;
          }
          
          .ball {
            position: absolute;
            width: 16px;
            height: 16px;
            background: radial-gradient(circle at 30% 30%, #ffffff, #00a8ff);
            border-radius: 50%;
            box-shadow: 0 0 15px 5px rgba(0, 152, 255, 0.8);
            z-index: 10;
            transform: translate(-50%, -50%);
          }
          
          .ball::after {
            content: '';
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            border-radius: 50%;
            background: transparent;
            border: 2px solid rgba(255, 255, 255, 0.4);
            opacity: 0;
            animation: pulse 2s infinite;
          }
          
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: ${sidebarOpen ? '200px' : '60px'};
            background: rgba(1, 9, 21, 0.8);
            backdrop-filter: blur(10px);
            z-index: 100;
            transition: width 0.3s ease;
            display: flex;
            flex-direction: column;
            border-right: 1px solid rgba(78, 159, 255, 0.1);
          }
          
          .top-navbar {
            position: fixed;
            top: 0;
            left: ${sidebarOpen ? '200px' : '60px'};
            right: 0;
            height: 60px;
            background: rgba(1, 9, 21, 0.8);
            backdrop-filter: blur(10px);
            z-index: 50;
            transition: left 0.3s ease;
            border-bottom: 1px solid rgba(78, 159, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
          }
          
          .social-icons {
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            gap: 15px;
            z-index: 10;
          }
          
          .social-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(1, 22, 39, 0.6);
            border-radius: 50%;
            border: 1px solid rgba(78, 159, 255, 0.3);
            transition: all 0.3s ease;
          }
          
          .social-icon:hover {
            transform: translateY(-5px);
            border-color: rgba(78, 159, 255, 0.8);
            box-shadow: 0 0 15px rgba(0, 162, 255, 0.4);
          }
          
          .terminal-input {
            background: rgba(1, 22, 39, 0.6);
            border: 1px solid rgba(78, 159, 255, 0.3);
            color: white;
            border-radius: 8px;
            padding: 12px 20px;
            font-family: 'Courier New', monospace;
            width: 100%;
            transition: all 0.3s ease;
          }
          
          .terminal-input:focus {
            border-color: rgba(78, 159, 255, 0.8);
            box-shadow: 0 0 15px rgba(0, 162, 255, 0.4);
            outline: none;
          }

          .main-content {
            padding-top: 70px;
            padding-left: ${sidebarOpen ? '210px' : '70px'};
            min-height: 100vh;
            transition: padding-left 0.3s ease;
          }

          .wallet-adapter-button {
            background: linear-gradient(90deg, rgba(0, 82, 155, 0.5), rgba(78, 159, 255, 0.5)) !important;
            background-size: 200% auto !important;
            color: white !important;
            border: 1px solid rgba(78, 159, 255, 0.4) !important;
            border-radius: 8px !important;
            padding: 0.5rem 1.25rem !important;
            transition: all 0.3s ease !important;
            font-family: inherit !important;
            font-weight: normal !important;
          }
          
          .wallet-adapter-button:hover {
            background-position: right center !important;
            box-shadow: 0 0 15px rgba(0, 162, 255, 0.4) !important;
            border-color: rgba(78, 159, 255, 0.8) !important;
          }

          .wallet-adapter-button-trigger {
            background: linear-gradient(90deg, rgba(0, 82, 155, 0.5), rgba(78, 159, 255, 0.5)) !important;
          }

          .wallet-adapter-dropdown-list {
            background: rgba(1, 22, 39, 0.9) !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(78, 159, 255, 0.3) !important;
          }

          .wallet-adapter-dropdown-list-item {
            color: white !important;
            border-color: rgba(78, 159, 255, 0.2) !important;
          }

          .wallet-adapter-dropdown-list-item:hover {
            background: rgba(78, 159, 255, 0.2) !important;
          }
        `}
      </style>
      
      {/* Navbar */}
      <div className="top-navbar">
        <div className="flex-1"></div>
        <div>
          <WalletMultiButton />
        </div>
      </div>
      
      {/* Sidebar */}
      <div className="sidebar">
        <div className="p-4 flex justify-between items-center border-b border-blue-900/30">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="rgba(78, 159, 255, 0.9)" strokeWidth="2" />
                <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" fill="none" stroke="rgba(78, 159, 255, 0.7)" strokeWidth="1.5" />
                <polygon points="50,30 70,40 70,60 50,70 30,60 30,40" fill="rgba(78, 159, 255, 0.5)" />
              </svg>
            </div>
            {sidebarOpen && <h2 className="text-blue-400 font-bold">Nexora</h2>}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-blue-400 hover:text-white p-1 rounded border border-blue-900/30 hover:bg-blue-900/30"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
        <div className="py-6">
          <a href="/" className="flex items-center px-4 py-3 text-gray-300 hover:bg-blue-900/30 hover:text-white transition-all">
            <HomeIcon className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3">Home</span>}
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-blue-900/30 hover:text-white transition-all">
            <FileText className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3">Docs</span>}
          </a>
        </div>
      </div>
      
      {/* Main content */}
      <div className="dark-space-bg main-content 0">
        <div className="container mx-auto max-w-6xl px-4 py-8 ">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 mt-20">
            {/* Left side - content */}
            <div className="w-full md:w-2/3 z-10" style={{ animation: "slideUp 0.8s ease-out 0.2s both" }}>
              <div className="text-center md:text-left mb-12">
                <h1 className="text-4xl font-bold text-white mb-6 leading-tight" 
                    style={{ animation: "slideUp 0.6s ease-out 0.8s both" }}>
                  Where Thought Becomes Agent. <br />And Agents Become Reality
                </h1>
                <p className="text-xl text-blue-200 mb-8"
                   style={{ animation: "slideUp 0.6s ease-out 1s both" }}>
                  Speak or type your vision. Nexora invokes an autonomous agent to build it.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mb-10">
                <div className="flex items-center p-2 pl-4 mb-4 rounded-lg border border-blue-500/30 bg-blue-900/10">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a prompt or goal..."
                    className="terminal-input bg-transparent border-0 shadow-none w-full"
                  />
                  <button type="submit" className="p-2 text-blue-400 hover:text-blue-300">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      type="button"
                      onClick={() => setPrompt("Generate a landing page for your memecoin")}
                      className="px-3 py-2 bg-blue-900/30 text-blue-200 text-sm rounded-md border border-blue-500/30 hover:bg-blue-800/40 hover:border-blue-400/50 transition-all"
                    >
                      Generate a landing page for your memecoin
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPrompt("Build a Solana portfolio tracker. (Frontend with hardcoded values)")}
                      className="px-3 py-2 bg-blue-900/30 text-blue-200 text-sm rounded-md border border-blue-500/30 hover:bg-blue-800/40 hover:border-blue-400/50 transition-all"
                    >
                      Build a Solana portfolio tracker using free APIs
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPrompt("Build a site showing crypto related news")}
                      className="px-3 py-2 bg-blue-900/30 text-blue-200 text-sm rounded-md border border-blue-500/30 hover:bg-blue-800/40 hover:border-blue-400/50 transition-all"
                    >
                      Build a site showing crypto related news
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Right side - hexagon */}
            <div className="w-full md:w-1/3 flex justify-center items-center z-10" style={{ animation: "fadeIn 1.5s ease-out" }}>
              <div className="hexagon-wrapper">
                <div className="hexagon-container">
                  <div className="hexagon-outer"></div>
                  <div className="hexagon-middle"></div>
                  <div className="hexagon-inner">
                    <div className="hexagon-core"></div>
                  </div>
                  <div className="ball" style={{
                    left: `${ballPos.x}px`,
                    top: `${ballPos.y}px`
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Social Icons */}
        <div className="social-icons">
          <a href="#" className="social-icon">
            <Twitter className="w-5 h-5 text-blue-400" />
          </a>
          <a href="#" className="social-icon">
            <Linkedin className="w-5 h-5 text-blue-400" />
          </a>
          <a href="#" className="social-icon">
            <Mail className="w-5 h-5 text-blue-400" />
          </a>
        </div>
      </div>
    </>
  );
}