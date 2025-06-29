import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as  Twitter, Linkedin, Mail, ArrowUp } from 'lucide-react';
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
            left:0;
            right: 0;
            height: 60px;
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
        <div className="flex-1 text-white">
          Naxora 🚀
        </div>
        <div>
          <WalletMultiButton />
        </div>
      </div>
      
      {/* Sidebar */}
      {/* <div className="sidebar">
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
      </div> */}
      
      {/* Main content */}
      <div className="bg-black main-content" style={{ backgroundImage: "url('/bg/bg2.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-center gap-10 mt-20 min-h-[70vh]">
            {/* Centered content */}
            <div className="w-full max-w-4xl z-10 text-center" style={{ animation: "slideUp 0.8s ease-out 0.2s both" }}>
              <div className="mb-12">
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
                <div className="relative  mb-4  bg-orange-900/10 hover:border-orange-400/50 transition-all">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a prompt or goal..."
                    className="terminal-input  border-0 shadow-none w-full min-h-[160px] text-lg resize-none focus:outline-none focus:ring-0 placeholder-blue-300/50 backdrop-filter: blur(8px)"
                  />
                  <button 
                    type="submit" 
                    className="absolute bottom-6 right-6 p-1 text-white hover:text-white bg-gray-100 rounded-full border border-blue-500/30 hover:bg-gray-700/60 hover:border-blue-400/50 transition-all flex items-center gap-2 opacity-100 "
                  >
                    {/* <span className="text-sm font-medium">Send</span> */}
                    {/* <Send className="w-4 h-4" /> */}
                    <ArrowUp className='text-black hover:text-white'/>
                  </button>
                </div>
                
                <div className="mt-6">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button 
                      type="button"
                      onClick={() => setPrompt("Generate a landing page for your memecoin")}
                      className="px-3 py-2 bg-blue-900/30 text-blue-200 text-sm rounded-md border border-blue-500/30 hover:bg-blue-800/40 hover:border-blue-400/50 transition-all"
                    >
                      Generate a landing page for your memecoin
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPrompt("Build a Solana portfolio tracker using free APIs")}
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
          </div>
        </div>
        
        {/* Social Icons */}
        <div className="social-icons">
          <a href="https://x.com/krshxxna" className="social-icon">
            <Twitter className="w-5 h-5 text-blue-400" />
          </a>
          <a href="https://www.linkedin.com/in/krishna-mohan-194124167/" className="social-icon">
            <Linkedin className="w-5 h-5 text-blue-400" />
          </a>
          <a href="mailto:krishanmohank974@gmail.com" target='_blank' className="social-icon">
            <Mail className="w-5 h-5 text-blue-400" />
          </a>
        </div>
      </div>
    </>
  );
}