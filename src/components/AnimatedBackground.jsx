/**
 * AnimatedBackground.jsx
 * Interactive animated aura background with flowing particles
 * Inspired by cosmic purple/blue aesthetics
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Detects device performance tier
 * - Reduces particle count on mobile/low-end devices
 * - Disables connections on low-end devices
 */
import { useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Detect performance tier based on device capabilities
 * Returns: 'high' | 'medium' | 'low'
 */
const getPerformanceTier = () => {
    // Safety check for SSR/initial render
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return 'medium';
    }

    // Check if running on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Check hardware concurrency (number of logical processors)
    const cores = navigator.hardwareConcurrency || 2;

    // Check screen size
    const isSmallScreen = window.innerWidth < 768;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;

    if (prefersReducedMotion) return 'disabled';
    if (isMobile || isSmallScreen || cores <= 2) return 'low';
    if (cores <= 4) return 'medium';
    return 'high';
};

/**
 * Performance settings for each tier
 */
const PERFORMANCE_SETTINGS = {
    high: {
        maxParticles: 300,  // Increased for more intense starfield
        drawConnections: true,
        connectionDistance: 120,
        particleDensity: 5000,  // More dense
    },
    medium: {
        maxParticles: 160,
        drawConnections: true,
        connectionDistance: 80,
        particleDensity: 8000,
    },
    low: {
        maxParticles: 60,
        drawConnections: false,
        connectionDistance: 0,
        particleDensity: 15000,
    },
    disabled: {
        maxParticles: 0,
        drawConnections: false,
        connectionDistance: 0,
        particleDensity: 999999,
    }
};

// Particle class moved outside component to prevent recreation
class Particle {
    constructor(canvas, isDistantStar = false) {
        this.canvas = canvas;
        this.isDistantStar = isDistantStar;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;

        // Create depth effect - distant stars are smaller and dimmer
        if (this.isDistantStar) {
            this.size = Math.random() * 1.5 + 0.5; // Slightly larger distant stars
            this.speedX = (Math.random() - 0.5) * 0.1; // Slower
            this.speedY = (Math.random() - 0.5) * 0.1;
            this.baseOpacity = Math.random() * 0.5 + 0.3; // Brighter
        } else {
            this.size = Math.random() * 3.5 + 1.2; // Much larger closer stars
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.baseOpacity = Math.random() * 0.4 + 0.6; // Brighter (0.6-1.0)
        }

        this.opacity = this.baseOpacity;

        // Cosmic color palette - more realistic star colors
        const colors = [
            { r: 255, g: 255, b: 255 },  // White (hot stars)
            { r: 200, g: 220, b: 255 },  // Blue-white
            { r: 139, g: 92, b: 246 },   // Purple
            { r: 168, g: 85, b: 247 },   // Violet
            { r: 99, g: 102, b: 241 },   // Indigo
            { r: 147, g: 51, b: 234 },   // Purple-600
            { r: 196, g: 181, b: 253 },  // Lavender
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];

        // Twinkling properties
        this.twinkleSpeed = Math.random() * 0.03 + 0.01;
        this.twinkleOffset = Math.random() * Math.PI * 2;
        this.twinkleAmount = Math.random() * 0.5 + 0.3; // How much it twinkles

        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update(mouse, time) {
        // Base movement
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse interaction - particles are attracted to mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;

        if (distance < maxDistance && distance > 0) {
            const force = (maxDistance - distance) / maxDistance;
            const angle = Math.atan2(dy, dx);
            this.speedX += Math.cos(angle) * force * 0.02;
            this.speedY += Math.sin(angle) * force * 0.02;

            // Increase opacity when near mouse
            this.opacity = Math.min(0.8, this.opacity + force * 0.1);
        } else {
            // Gradually return to base opacity
            this.opacity = Math.max(0.1, this.opacity - 0.005);
        }

        // Damping
        this.speedX *= 0.99;
        this.speedY *= 0.99;

        // Pulsing effect
        const pulse = Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.5 + 0.5;
        this.currentSize = this.size * (0.8 + pulse * 0.4);

        // Wrap around edges
        if (this.x < -10) this.x = this.canvas.width + 10;
        if (this.x > this.canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = this.canvas.height + 10;
        if (this.y > this.canvas.height + 10) this.y = -10;
    }

    // Simple update with twinkling effect for realistic stars
    // Particles disperse and keep moving naturally when not interacting
    updateSimple(mouse, time) {
        // Twinkling effect - stars flicker in brightness
        const twinkle = Math.sin(time * 0.001 * this.twinkleSpeed * 50 + this.twinkleOffset);
        this.opacity = this.baseOpacity + (twinkle * this.twinkleAmount * this.baseOpacity * 0.5);
        this.opacity = Math.max(0.1, Math.min(1, this.opacity));

        // Add gentle random drift to keep particles moving naturally
        this.speedX += (Math.random() - 0.5) * 0.008;
        this.speedY += (Math.random() - 0.5) * 0.008;

        // Ensure minimum base speed so particles always move (gentler for realism)
        const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        const minSpeed = this.isDistantStar ? 0.05 : 0.15;
        if (currentSpeed < minSpeed) {
            const angle = Math.random() * Math.PI * 2;
            this.speedX = Math.cos(angle) * minSpeed;
            this.speedY = Math.sin(angle) * minSpeed;
        }

        // Base movement
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse interaction - only for closer stars
        if (!this.isDistantStar) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 150;

            if (distance < maxDistance && distance > 0) {
                const force = (maxDistance - distance) / maxDistance;
                const angle = Math.atan2(dy, dx);
                this.speedX += Math.cos(angle) * force * 0.01;
                this.speedY += Math.sin(angle) * force * 0.01;
            }
        }

        // Limit max speed
        const maxSpeed = this.isDistantStar ? 0.3 : 1.0;
        if (currentSpeed > maxSpeed) {
            this.speedX = (this.speedX / currentSpeed) * maxSpeed;
            this.speedY = (this.speedY / currentSpeed) * maxSpeed;
        }

        // Light damping
        this.speedX *= 0.998;
        this.speedY *= 0.998;

        // Keep size constant (no pulsing)
        this.currentSize = this.size;

        // Wrap around edges
        if (this.x < -10) this.x = this.canvas.width + 10;
        if (this.x > this.canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = this.canvas.height + 10;
        if (this.y > this.canvas.height + 10) this.y = -10;
    }

    draw(ctx) {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.currentSize * 3
        );
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.currentSize * 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw crisp star-like particle with glow effect
    drawCrisp(ctx) {
        // Draw subtle glow for larger stars
        if (this.size > 1.2 && !this.isDistantStar) {
            ctx.beginPath();
            const glowGradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.currentSize * 4
            );
            glowGradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.3})`);
            glowGradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
            ctx.fillStyle = glowGradient;
            ctx.arc(this.x, this.y, this.currentSize * 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw star core
        ctx.beginPath();
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw bright center for larger stars
        if (this.size > 1.5 && !this.isDistantStar) {
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.7})`;
            ctx.arc(this.x, this.y, this.currentSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

const AnimatedBackground = ({ disableGlow = false }) => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const particlesRef = useRef([]);
    const animationRef = useRef(null);

    // Get performance tier once on mount
    const performanceTier = useMemo(() => getPerformanceTier(), []);
    const settings = PERFORMANCE_SETTINGS[performanceTier];

    // Initialize particles based on performance tier
    const initParticles = useCallback((canvas) => {
        // Skip if animations are disabled
        if (settings.maxParticles === 0) {
            particlesRef.current = [];
            return;
        }

        const particleCount = Math.floor((canvas.width * canvas.height) / settings.particleDensity);
        const totalParticles = Math.min(particleCount, settings.maxParticles);
        particlesRef.current = [];

        // Create layered star field - 60% distant stars, 40% close stars
        const distantCount = Math.floor(totalParticles * 0.6);
        const closeCount = totalParticles - distantCount;

        // Add distant background stars (tiny, slow, dim)
        for (let i = 0; i < distantCount; i++) {
            particlesRef.current.push(new Particle(canvas, true));
        }

        // Add closer foreground stars (larger, brighter, interactive)
        for (let i = 0; i < closeCount; i++) {
            particlesRef.current.push(new Particle(canvas, false));
        }
    }, [settings]);

    // Draw connections between nearby particles (only on high/medium tier)
    const drawConnections = useCallback((ctx, particles) => {
        // Skip connections on low-end devices
        if (!settings.drawConnections) return;

        const maxDistance = settings.connectionDistance;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.15;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }, [settings]);

    // Draw crisp visible connections for dashboard (cleaner look)
    const drawCrispConnections = useCallback((ctx, particles) => {
        const maxDistance = 150; // Larger distance for more connections

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.4; // More visible
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                    ctx.lineWidth = 0.8; // Slightly thicker lines
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }, []);

    // Draw ambient glow spots
    const drawAmbientGlow = useCallback((ctx, canvas, time) => {
        const glowSpots = [
            { x: canvas.width * 0.2, y: canvas.height * 0.3, r: 200, color: 'rgba(139, 92, 246, 0.03)' },
            { x: canvas.width * 0.8, y: canvas.height * 0.7, r: 250, color: 'rgba(59, 130, 246, 0.03)' },
            { x: canvas.width * 0.5, y: canvas.height * 0.5, r: 300, color: 'rgba(168, 85, 247, 0.02)' },
        ];

        glowSpots.forEach((spot, index) => {
            const pulse = Math.sin(time * 0.001 + index) * 0.5 + 0.5;
            const gradient = ctx.createRadialGradient(
                spot.x + Math.sin(time * 0.0005 + index) * 50,
                spot.y + Math.cos(time * 0.0003 + index) * 30,
                0,
                spot.x, spot.y,
                spot.r * (1 + pulse * 0.2)
            );
            gradient.addColorStop(0, spot.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let startTime = Date.now();

        // Handle resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles(canvas);
        };

        // Handle mouse move
        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        // Handle touch
        const handleTouch = (e) => {
            if (e.touches.length > 0) {
                mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };

        // Animation loop
        const animate = () => {
            const currentTime = Date.now() - startTime;

            // Clear canvas - solid black for dashboard, trail effect for landing
            if (disableGlow) {
                ctx.fillStyle = '#000000';
            } else {
                ctx.fillStyle = 'rgba(9, 9, 11, 0.1)';
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw ambient glow (skip if disabled for cleaner look)
            if (!disableGlow) {
                drawAmbientGlow(ctx, canvas, currentTime);
            }

            // Update and draw particles
            particlesRef.current.forEach(particle => {
                // Use simple update with twinkling for dashboard
                if (disableGlow) {
                    particle.updateSimple(mouseRef.current, currentTime);
                    particle.drawCrisp(ctx);
                } else {
                    particle.update(mouseRef.current, currentTime);
                    particle.draw(ctx);
                }
            });

            // Draw connections - use crisp version for dashboard
            if (disableGlow) {
                drawCrispConnections(ctx, particlesRef.current);
            } else {
                drawConnections(ctx, particlesRef.current);
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        // Initialize
        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouch);

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouch);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [initParticles, drawConnections, drawAmbientGlow]);

    return (
        <canvas
            ref={canvasRef}
            className="animated-background"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
                background: 'linear-gradient(135deg, #09090b 0%, #0c0a1a 50%, #09090b 100%)',
            }}
        />
    );
};

export default AnimatedBackground;
