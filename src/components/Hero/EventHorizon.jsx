import { useMemo, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles, Float } from '@react-three/drei';

// Memoized MilkyWay component to prevent unnecessary re-renders
const MilkyWay = memo(() => {
    return (
        <group rotation={[Math.PI / 3, 0, 0]}>
            {/* Core Galaxy Band - Dense & Violet/Pink */}
            <Sparkles
                count={2000}
                scale={[30, 5, 30]}
                size={4}
                speed={0.05}
                opacity={0.5}
                color="#c084fc"
                noise={0.5}
            />
            {/* Outer Galaxy Arms - Blue/Cyan */}
            <Sparkles
                count={1500}
                scale={[40, 10, 40]}
                size={3}
                speed={0.03}
                opacity={0.3}
                color="#3b82f6"
                noise={1}
            />
            {/* Dust/Nebula Haze - using large blurry sparkles */}
            <Sparkles
                count={500}
                scale={[25, 8, 25]}
                size={20}
                speed={0.02}
                opacity={0.15}
                color="#e879f9"
                noise={2}
            />
        </group>
    );
});

MilkyWay.displayName = 'MilkyWay';

const EventHorizon = memo(() => {
    // Memoize static scene elements
    const sceneContent = useMemo(() => (
        <Float speed={0.4} rotationIntensity={0.2} floatIntensity={0.2}>
            <MilkyWay />

            {/* Deep Background Stars - High count, small, white/faint */}
            <Stars
                radius={100}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={0.1}
            />

            {/* Mid-layer Colored Stars */}
            <Stars
                radius={100}
                depth={50}
                count={1000}
                factor={6}
                saturation={1}
                fade
                speed={0.2}
            />

            {/* Bright Foreground Stars/Sparkles */}
            <Sparkles
                count={200}
                scale={20}
                size={4}
                speed={0.1}
                opacity={0.9}
                color="#ffffff"
            />

            {/* Nebula Gas Clouds - Large, soft, colored areas */}
            <Sparkles
                count={50}
                scale={[40, 20, 40]}
                size={50}
                speed={0.2}
                opacity={0.1}
                color="#581c87"
                noise={1}
            />
            <Sparkles
                count={30}
                scale={[30, 30, 20]}
                size={60}
                speed={0.1}
                opacity={0.05}
                color="#1e3a8a"
                noise={2}
            />
        </Float>
    ), []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#000000]">
            <Canvas
                camera={{ position: [0, 0, 20], fov: 60 }}
                gl={{
                    antialias: false,
                    alpha: true,
                    powerPreference: 'high-performance'
                }}
                dpr={[1, 1.5]}
            >
                <fog attach="fog" args={['#000000', 10, 150]} />

                {sceneContent}

                {/* Ambient glow effect */}
                <pointLight position={[10, 10, 10]} intensity={0.5} color="#8b5cf6" />
                <pointLight position={[-10, -10, -10]} intensity={0.2} color="#3b82f6" />
            </Canvas>

            {/* Vignette Overlay to blend with UI */}
            <div
                className="absolute inset-0 z-10"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, transparent 0%, #000000 100%)',
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
});

EventHorizon.displayName = 'EventHorizon';

export default EventHorizon;
