import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader } from './Loader';

interface PreviewFrameProps {
  webContainer: WebContainer | null;
}

export function PreviewFrame({ webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing preview...');
  const [isLoading, setIsLoading] = useState(true);

  async function main() {
    if (!webContainer) return;
    
    setIsLoading(true);
    const messages = [
      'Initializing preview...',
      'Installing dependencies...',
      'Starting development server...',
      'Compiling assets...',
      'Almost ready...'
    ];
    
    let currentMessageIndex = 0;
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
      
      if (currentMessageIndex < messages.length - 1) {
        currentMessageIndex++;
        setLoadingMessage(messages[currentMessageIndex]);
      }
    }, 50);

    try {
      const installProcess = await webContainer.spawn('pnpm', ['install']);
      await installProcess.exit;

      const devProcess = await webContainer.spawn('pnpm', ['dev']);
      devProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log(data);
        }
      }));
      // Wait for `server-ready` event
      webContainer.on('server-ready', (port, url) => {
        setUrl(url);
        setIsLoading(false);
        clearInterval(progressInterval);
        setLoadingProgress(100);
        console.log("--------------------------------")
        console.log("--------------------------------")
        console.log("Your server is ready to view")
        console.log("Server ready at ", url)
        console.log("Port : ", port)
        console.log("--------------------------------")
        console.log("--------------------------------")
      });
    } catch (error) {
      console.error('Preview initialization failed:', error);
      setIsLoading(false);
      clearInterval(progressInterval);
    }
  }

  useEffect(() => {
    main();
  }, [webContainer]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center space-y-6 w-full max-w-md px-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-20 animate-pulse"></div>
            <div className="relative">
              <Loader />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{loadingMessage}</p>
            <div className="w-full bg-secondary/20 rounded-full h-2">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{loadingProgress}%</p>
          </div>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p className="text-sm text-muted-foreground">Preview not available</p>
      </div>
    );
  }

  return <iframe width="100%" height="100%" src={url} />;
}