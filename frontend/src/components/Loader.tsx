import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sparkles, Code2, Rocket } from 'lucide-react';

interface LoaderProps {
  message?: string;
  showProgress?: boolean;
}

export function Loader({ message = "Loading...", showProgress = false }: LoaderProps) {
    const [progress, setProgress] = useState(0);
    const [sparklePosition, setSparklePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (showProgress) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 1;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [showProgress]);

    // Animate sparkles
    useEffect(() => {
        const interval = setInterval(() => {
            setSparklePosition({
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div role="status" className="flex flex-col justify-center items-center w-full pt-4 space-y-6 relative">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />

            {/* Main loader */}
            <div className="relative">
                <motion.div
                    className="flex space-x-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="relative"
                        >
                            <motion.div
                                className="w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg"
                                animate={{
                                    y: ['0%', '-100%', '0%'],
                                    scale: [1, 0.8, 1],
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: 'easeInOut',
                                }}
                            />
                            {/* Glow effect */}
                            <motion.div
                                className="absolute inset-0 bg-blue-500 rounded-full blur-md"
                                animate={{
                                    opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Floating icons */}
                <motion.div
                    className="absolute -right-8 -top-8 text-purple-500"
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <Code2 size={16} />
                </motion.div>
                <motion.div
                    className="absolute -left-8 -bottom-8 text-blue-500"
                    animate={{
                        rotate: -360,
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <Rocket size={16} />
                </motion.div>
            </div>
            
            {/* Message with sparkle effect */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative text-base font-medium bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
            >
                {message}
                <motion.div
                    className="absolute text-yellow-400"
                    animate={{
                        x: sparklePosition.x,
                        y: sparklePosition.y,
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                    }}
                >
                    <Sparkles size={12} />
                </motion.div>
            </motion.div>

            {/* Progress bar */}
            {showProgress && (
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '100%' }}
                    className="w-full max-w-xs relative"
                >
                    {/* Background bar */}
                    <div className="h-2 bg-gray-700/50 rounded-full backdrop-blur-sm" />
                    
                    {/* Progress indicator */}
                    <motion.div
                        className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-blue-500/50 blur-sm rounded-full" />
                    </motion.div>

                    {/* Percentage text */}
                    <motion.div
                        className="absolute -right-8 -top-1 text-xs font-medium text-blue-500"
                        animate={{
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                        }}
                    >
                        {progress}%
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}