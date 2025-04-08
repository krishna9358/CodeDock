import { motion } from 'framer-motion';

export function Loader() {
    return (
        <div role="status" className="flex justify-center items-center w-full pt-4">
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
            <span className="sr-only">Loading...</span>
        </div>
    );
}