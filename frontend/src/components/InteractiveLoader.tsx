import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from './Loader';
import { Terminal } from './Terminal';
import { FileText, Package, Cog, Rocket, Palette, Smartphone, Wrench, Sparkles } from 'lucide-react';

interface InteractiveLoaderProps {
  onComplete: () => void;
  files: any[];
  onInstallDependencies: () => Promise<void>;
}

const BULLETIN_ICONS = {
  "🔍": FileText,
  "📦": Package,
  "⚙️": Cog,
  "🚀": Rocket,
  "🎨": Palette,
  "📱": Smartphone,
  "🔧": Wrench,
  "✨": Sparkles,
};

export function InteractiveLoader({ onComplete, files, onInstallDependencies }: InteractiveLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [visibleBulletins, setVisibleBulletins] = useState<number[]>([]);

  const bulletins = [
    "Analyzing project structure...",
    "Setting up development environment...",
    "Initializing project...",
    "Configuring UI components...",
    "Configuring build tools...",
    "Adding finishing touches..."
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

  const getIconComponent = (bulletin: string) => {
    const emoji = bulletin.split(' ')[0];
    // @ts-ignore
    return BULLETIN_ICONS[emoji] || FileText;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-8 p-8 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 relative"
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-3xl" />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
        >
          Setting up your project
        </motion.h2>

        <div className=" text-left  p-4  bordershadow-xl">
          <AnimatePresence>
            {visibleBulletins.map((index) => {
              const IconComponent = getIconComponent(bulletins[index]);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex items-center space-x-3 text-muted-foreground py-2"
                >
                  <motion.div
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-primary"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <IconComponent size={18} />
                  </motion.div>
                  <span className="text-primary font-medium">{bulletins[index]}</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* <div className="relative">
          <Loader 
            message={`Processing ${files.length} files...`}
            showProgress={true}
          />
        </div> */}
      </motion.div>

      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-base text-muted-foreground text-center max-w-md bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10"
      >
        <motion.span
          animate={{
            color: ['#60A5FA', '#8B5CF6', '#60A5FA'],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="font-medium"
        >
          Almost there!
        </motion.span>
        <br />
        While we prepare your project, you can explore the generated files.
        <br />
        The preview will be available shortly.
      </motion.div> */}
    </div>
  );
} 