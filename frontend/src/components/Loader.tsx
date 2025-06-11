import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LoaderProps {
  message?: string;
  showProgress?: boolean;
}

export function Loader({ message = "Loading...", showProgress = false }: LoaderProps) {
    const [progress, setProgress] = useState(0);

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

    return (
        <div role="status" className="flex flex-col justify-center items-center w-full pt-4 space-y-4">
            <motion.div
                className="flex space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-4 h-4 bg-blue-600 rounded-full"
                        animate={{
                            y: ['0%', '-50%', '0%'],
                            scale: [1, 0.8, 1],
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-gray-400"
            >
                {message}
            </motion.div>

            {showProgress && (
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '100%' }}
                    className="w-full max-w-xs bg-gray-700 rounded-full h-2.5"
                >
                    <motion.div
                        className="bg-blue-600 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </motion.div>
            )}
            
            <span className="sr-only">Loading...</span>
        </div>
    );
}