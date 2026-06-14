import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const HeroButton = ({ children, primary = true, onClick, className }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={clsx(
                "group relative overflow-hidden px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-colors",
                primary
                    ? "bg-primary text-white shadow-glow"
                    : "bg-surface border border-primary/30 text-primary hover:bg-primary/10",
                className
            )}
        >
            <div className="relative z-10 flex items-center gap-2">
                {children}
                {primary && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </div>

            {/* Liquid Background Effect for Primary */}
            {primary && (
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-100" />
                    <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            )}
        </motion.button>
    );
};

export default HeroButton;
