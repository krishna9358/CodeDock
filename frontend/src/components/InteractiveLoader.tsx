import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from './Loader';
import { Terminal } from './Terminal';

interface InteractiveLoaderProps {
  onComplete: () => void;
  files: any[];
  onInstallDependencies: () => Promise<void>;
}

export function InteractiveLoader({ onComplete, files, onInstallDependencies }: InteractiveLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [visibleBulletins, setVisibleBulletins] = useState<number[]>([]);

  const bulletins = [
    "🔍 Analyzing project structure...",
    "📦 Preparing dependencies...",
    "⚙️ Setting up development environment...",
    "🚀 Initializing project...",
    "🎨 Configuring UI components...",
    "📱 Setting up responsive layouts...",
    "🔧 Configuring build tools...",
    "✨ Adding finishing touches..."
  ];

  useEffect(() => {
    // Add bulletins one by one
    const bulletinInterval = setInterval(() => {
      setVisibleBulletins(prev => {
        if (prev.length < bulletins.length) {
          return [...prev, prev.length];
        }
        clearInterval(bulletinInterval);
        return prev;
      });
    }, 2000);

    return () => clearInterval(bulletinInterval);
  }, []);

  useEffect(() => {
    if (visibleBulletins.length === bulletins.length) {
      // All bulletins are shown, complete the loading
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visibleBulletins, onComplete]);

  useEffect(() => {
    const startInstallation = async () => {
      setIsInstalling(true);
      try {
        await onInstallDependencies();
        setTerminalOutput(prev => [...prev, "✅ Dependencies installed successfully"]);
      } catch (error) {
        setTerminalOutput(prev => [...prev, "❌ Error installing dependencies"]);
      }
      setIsInstalling(false);
    };

    // Start installation only when all files are received
    if (files.length > 0) {
      startInstallation();
    }
  }, [files, onInstallDependencies]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-8 p-8 bg-background/95">
      <div className="text-center space-y-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Setting up your project
        </motion.h2>

        <div className="space-y-3 text-left max-w-md mx-auto">
          <AnimatePresence>
            {visibleBulletins.map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center space-x-3 text-muted-foreground"
              >
                <span className="text-primary">{bulletins[index]}</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Loader 
          message={`Processing ${files.length} files...`}
          showProgress={true}
        />
      </div>


      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-sm text-muted-foreground text-center max-w-md"
      >
        While we prepare your project, you can explore the generated files.
        The preview will be available shortly.
      </motion.div>
    </div>
  );
} 