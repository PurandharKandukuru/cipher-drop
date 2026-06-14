/**
 * DashboardLayout Component
 * Layout wrapper for authenticated pages with navigation.
 *
 * variant:
 *   'default'  - dark cosmic theme with animated starfield (Upload, etc.)
 *   'platform' - premium dark "Platform Architecture" surface (Dashboard) with a
 *                perspective horizon grid (floor + mirrored ceiling), glowing
 *                vanishing point, film grain, and subtle mouse parallax.
 */
import { useEffect, useRef } from 'react';
import Header from './Header';
import { MobileNav, AnimatedBackground } from '../components';

const DashboardLayout = ({ children, user, onLogout, variant = 'default' }) => {
    const gridRef = useRef(null);

    // Subtle eased mouse parallax on the grid scene (platform variant only)
    useEffect(() => {
        if (variant !== 'platform') return;
        const el = gridRef.current;
        if (!el) return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;

        let raf = 0;
        let tx = 0, ty = 0, cx = 0, cy = 0;

        const tick = () => {
            cx += (tx - cx) * 0.08;
            cy += (ty - cy) * 0.08;
            el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
            if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
                raf = requestAnimationFrame(tick);
            } else {
                raf = 0;
            }
        };
        const onMove = (e) => {
            tx = (e.clientX / window.innerWidth - 0.5) * -24;
            ty = (e.clientY / window.innerHeight - 0.5) * -16;
            if (!raf) raf = requestAnimationFrame(tick);
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', onMove);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [variant]);

    if (variant === 'platform') {
        return (
            <div className="min-h-screen pb-20 md:pb-0 relative bg-[#060609]">
                {/* Perspective horizon grid scene + radiant glow (covers the global canvas) */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-[#060609]" />
                    {/* Parallax group */}
                    <div ref={gridRef} className="absolute -inset-16 will-change-transform">
                        <div className="pa-horizon-sun" />
                        <div className="pa-horizon-glow" />
                        <div className="pa-horizon-ceil" />
                        <div className="pa-horizon-floor" />
                        <div className="pa-horizon-line" />
                        <div className="absolute -top-32 left-1/4 w-[680px] h-[680px] rounded-full bg-[#6366F1]/[0.07] blur-[150px]" />
                        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-[#A855F7]/[0.06] blur-[150px]" />
                    </div>
                    {/* Static framing (no parallax) */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_28%,transparent,rgba(6,6,9,0.7))]" />
                    <div className="pa-grain" />
                </div>

                <div className="relative z-10">
                    <Header isAuthenticated={true} user={user} onLogout={onLogout} />
                    <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
                        {children}
                    </main>
                    <MobileNav />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 md:pb-0 relative">
            {/* Cosmic animated background - without glow for cleaner dashboard look */}
            <AnimatedBackground disableGlow />
            <div className="relative z-10">
                <Header isAuthenticated={true} user={user} onLogout={onLogout} />
                <main className="container mx-auto px-4 py-8">
                    {children}
                </main>
                {/* Mobile bottom navigation */}
                <MobileNav />
            </div>
        </div>
    );
};

export default DashboardLayout;
