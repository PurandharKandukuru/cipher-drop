import { useRef, useState, useMemo, memo } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Lock, Shield, Key, FileCheck, Server } from 'lucide-react';
import clsx from 'clsx';

// Smooth spring configuration for buttery animations
const smoothSpringConfig = {
    stiffness: 150,
    damping: 15,
    mass: 0.1
};

const Vault3D = memo(() => {
    const ref = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Use smooth spring config for fluid motion
    const mouseXSpring = useSpring(x, smoothSpringConfig);
    const mouseYSpring = useSpring(y, smoothSpringConfig);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

    const handleMouseMove = (e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setIsHovered(false);
    };

    // Memoize binary pattern to prevent re-renders
    const binaryPattern = useMemo(() => (
        <div className="text-primary/10 font-mono text-xs p-4 overflow-hidden h-full w-full select-none">
            {Array.from({ length: 20 }).map((_, j) => (
                <div key={j} className="whitespace-nowrap">
                    01010101010101010101010101010
                </div>
            ))}
        </div>
    ), []);

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className="relative w-72 h-96 md:w-80 md:h-[28rem] cursor-pointer will-change-transform"
        >
            {/* Back Layers - Expanded on Hover with smooth transitions */}
            {[1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    animate={{
                        z: isHovered ? -40 * i : -10 * i,
                        y: isHovered ? -20 * i : -5 * i,
                        x: isHovered ? 20 * i : 5 * i,
                        opacity: isHovered ? 1 : 0.6,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        mass: 0.5
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                    className={clsx(
                        "absolute inset-0 rounded-2xl border border-primary/30 bg-surface/80 backdrop-blur-sm",
                        "shadow-2xl shadow-primary/10 flex items-center justify-center will-change-transform"
                    )}
                >
                    {binaryPattern}
                </motion.div>
            ))}

            {/* Main Card */}
            <motion.div
                style={{ transformStyle: "preserve-3d", translateZ: 20 }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-surface to-background border border-primary/50 overflow-hidden shadow-glow will-change-transform"
            >
                <div className="absolute inset-0 bg-primary/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-between p-8 z-10">
                    <div className="w-full flex justify-between items-start">
                        <Shield className="text-primary w-8 h-8" />
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse delay-75" />
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-150" />
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-4 border-2 border-dashed border-primary/30 rounded-full will-change-transform"
                            />
                            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                                <Lock className="w-12 h-12 text-primary" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-text">AES-256</h3>
                            <p className="text-xs text-text-muted font-mono mt-1">SECURE_VAULT_ACTIVE</p>
                        </div>
                    </div>

                    <div className="w-full grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center p-2 rounded bg-surface border border-primary/10">
                            <Key className="w-4 h-4 text-primary mb-1" />
                            <span className="text-[10px] text-text-muted">Keys</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded bg-surface border border-primary/10">
                            <FileCheck className="w-4 h-4 text-primary mb-1" />
                            <span className="text-[10px] text-text-muted">Verify</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded bg-surface border border-primary/10">
                            <Server className="w-4 h-4 text-primary mb-1" />
                            <span className="text-[10px] text-text-muted">Store</span>
                        </div>
                    </div>
                </div>

                {/* Scanline Effect */}
                <motion.div
                    animate={{ top: ["0%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-primary/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] z-20 pointer-events-none will-change-transform"
                />
            </motion.div>
        </motion.div>
    );
});

Vault3D.displayName = 'Vault3D';

export default Vault3D;
