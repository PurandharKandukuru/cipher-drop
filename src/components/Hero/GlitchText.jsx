import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

const GlitchText = ({ text, className = '', heroMode = false }) => {
    const [displayText, setDisplayText] = useState(text);
    const intervalRef = useRef(null);
    const originalText = text;

    const triggerGlitch = () => {
        let iteration = 0;
        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setDisplayText(prev =>
                originalText
                    .split('')
                    .map((letter, index) => {
                        if (index < iteration) {
                            return originalText[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('')
            );

            if (iteration >= originalText.length) {
                clearInterval(intervalRef.current);
            }

            iteration += 1 / 3;
        }, 30);
    };

    useEffect(() => {
        triggerGlitch();
        return () => clearInterval(intervalRef.current);
    }, [text]);

    // Hero mode with dramatic CSS glitch effect
    if (heroMode) {
        return (
            <>
                <span
                    className={`glitch-hero ${className}`}
                    data-text={displayText}
                    onMouseEnter={triggerGlitch}
                >
                    {displayText}
                </span>
                <style>{`
                    .glitch-hero {
                        position: relative;
                        display: inline-block;
                        animation: glitch-skew 1s infinite linear alternate-reverse;
                    }
                    
                    .glitch-hero::before,
                    .glitch-hero::after {
                        content: attr(data-text);
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: transparent;
                    }
                    
                    .glitch-hero::before {
                        left: 2px;
                        text-shadow: -2px 0 #ff00ea;
                        clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
                        animation: glitch-anim 2.5s infinite linear alternate-reverse;
                    }
                    
                    .glitch-hero::after {
                        left: -2px;
                        text-shadow: 2px 0 #00f7ff;
                        clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
                        animation: glitch-anim2 1.5s infinite linear alternate-reverse;
                    }
                    
                    @keyframes glitch-anim {
                        0% {
                            clip-path: polygon(0 2%, 100% 2%, 100% 5%, 0 5%);
                        }
                        10% {
                            clip-path: polygon(0 15%, 100% 15%, 100% 15%, 0 15%);
                        }
                        20% {
                            clip-path: polygon(0 10%, 100% 10%, 100% 20%, 0 20%);
                        }
                        30% {
                            clip-path: polygon(0 1%, 100% 1%, 100% 2%, 0 2%);
                        }
                        40% {
                            clip-path: polygon(0 33%, 100% 33%, 100% 33%, 0 33%);
                        }
                        50% {
                            clip-path: polygon(0 44%, 100% 44%, 100% 44%, 0 44%);
                        }
                        60% {
                            clip-path: polygon(0 50%, 100% 50%, 100% 20%, 0 20%);
                        }
                        70% {
                            clip-path: polygon(0 70%, 100% 70%, 100% 70%, 0 70%);
                        }
                        80% {
                            clip-path: polygon(0 80%, 100% 80%, 100% 80%, 0 80%);
                        }
                        90% {
                            clip-path: polygon(0 50%, 100% 50%, 100% 55%, 0 55%);
                        }
                        100% {
                            clip-path: polygon(0 60%, 100% 60%, 100% 70%, 0 70%);
                        }
                    }
                    
                    @keyframes glitch-anim2 {
                        0% {
                            clip-path: polygon(0 78%, 100% 78%, 100% 100%, 0 100%);
                        }
                        10% {
                            clip-path: polygon(0 65%, 100% 65%, 100% 72%, 0 72%);
                        }
                        20% {
                            clip-path: polygon(0 85%, 100% 85%, 100% 95%, 0 95%);
                        }
                        30% {
                            clip-path: polygon(0 92%, 100% 92%, 100% 98%, 0 98%);
                        }
                        40% {
                            clip-path: polygon(0 70%, 100% 70%, 100% 75%, 0 75%);
                        }
                        50% {
                            clip-path: polygon(0 88%, 100% 88%, 100% 92%, 0 92%);
                        }
                        60% {
                            clip-path: polygon(0 75%, 100% 75%, 100% 82%, 0 82%);
                        }
                        70% {
                            clip-path: polygon(0 68%, 100% 68%, 100% 73%, 0 73%);
                        }
                        80% {
                            clip-path: polygon(0 90%, 100% 90%, 100% 95%, 0 95%);
                        }
                        90% {
                            clip-path: polygon(0 80%, 100% 80%, 100% 85%, 0 85%);
                        }
                        100% {
                            clip-path: polygon(0 72%, 100% 72%, 100% 78%, 0 78%);
                        }
                    }
                    
                    @keyframes glitch-skew {
                        0% {
                            transform: skew(0deg);
                        }
                        10% {
                            transform: skew(0.5deg);
                        }
                        20% {
                            transform: skew(-0.5deg);
                        }
                        30% {
                            transform: skew(0deg);
                        }
                        40% {
                            transform: skew(0.3deg);
                        }
                        50% {
                            transform: skew(-0.3deg);
                        }
                        60% {
                            transform: skew(0deg);
                        }
                        70% {
                            transform: skew(-0.5deg);
                        }
                        80% {
                            transform: skew(0deg);
                        }
                        90% {
                            transform: skew(0.5deg);
                        }
                        100% {
                            transform: skew(0deg);
                        }
                    }
                `}</style>
            </>
        );
    }

    return (
        <motion.span
            className={`font-mono inline-block ${className}`}
            whileHover={{ scale: 1.05, color: '#A855F7' }}
            onMouseEnter={triggerGlitch}
        >
            {displayText}
        </motion.span>
    );
};

export default GlitchText;
