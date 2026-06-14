/**
 * Landing Page - Enhanced with Animations
 * Hero section with floating icons, animated gradients, and modern effects
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Shield,
    Lock,
    Eye,
    Upload,
    ArrowRight,
    Server,
    Zap,
    Globe,
} from 'lucide-react';

import { Button, Card } from '../components';
import { Header } from '../layouts';
import { Vault3D, EventHorizon, GlitchText, HeroButton } from '../components/Hero';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars -- used as <motion.div> JSX namespace
import { useAuth } from '../context/AuthContext';

// Animated Counter Component
const AnimatedCounter = ({ value, label }) => {
    const [displayValue, setDisplayValue] = useState('0');

    useEffect(() => {
        // Simple animation - just display the value after a delay
        const timer = setTimeout(() => setDisplayValue(value), 300);
        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div className="text-center group">
            <div className="text-2xl md:text-3xl font-bold text-primary transition-transform group-hover:scale-110">
                {displayValue}
            </div>
            <div className="text-sm text-text-muted">{label}</div>
        </div>
    );
};

const LandingPage = () => {
    const { user } = useAuth();

    // Feature cards data
    const features = [
        {
            icon: Lock,
            title: 'AES-256 Encryption',
            description: 'Military-grade encryption protects your files with the same standard used by governments worldwide.',
            gradient: 'from-emerald-500 to-teal-500'
        },
        {
            icon: Eye,
            title: 'Client-Side Encryption',
            description: 'Files are encrypted in your browser before they ever leave your device. We never see your data.',
            gradient: 'from-teal-500 to-cyan-500'
        },
        {
            icon: Server,
            title: 'Zero-Knowledge Storage',
            description: 'Our servers store only encrypted data. Even we cannot access your files without your password.',
            gradient: 'from-cyan-500 to-emerald-500'
        },
    ];



    return (
        <div className="min-h-screen bg-background overflow-hidden">
            <Header />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                <EventHorizon />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
                        {/* Text Content */}
                        <div className="flex-1 text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm">
                                    <div className="relative">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                                    </div>
                                    <span className="text-sm font-mono text-primary">SYSTEM_SECURE</span>
                                </div>

                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-text leading-tight mb-6 tracking-tight">
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                                        Secure Your
                                    </span>
                                    <div className="flex items-center justify-center lg:justify-start gap-4">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-indigo-500">
                                            Digital List
                                        </span>
                                    </div>
                                </h1>

                                <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                                    <GlitchText text="Military-grade encryption" className="text-primary" /> for your sensitive files.
                                    Experience the next generation of secure file sharing with zero-knowledge architecture.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                    <Link to={user ? "/upload" : "/register"}>
                                        <HeroButton>START ENCRYPTION</HeroButton>
                                    </Link>
                                    <a
                                        href="#features"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <HeroButton primary={false} icon={ArrowRight}>
                                            SYSTEM SPECS
                                        </HeroButton>
                                    </a>
                                </div>

                                <div className="mt-12 flex items-center justify-center lg:justify-start gap-8">
                                    <div>
                                        <div className="text-2xl font-bold text-white">AES-256</div>
                                        <div className="text-xs uppercase tracking-wider text-gray-400">Encryption</div>
                                    </div>
                                    <div className="w-px h-10 bg-gray-700" />
                                    <div>
                                        <div className="text-2xl font-bold text-white">0.00%</div>
                                        <div className="text-xs uppercase tracking-wider text-gray-400">Data Leaks</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* 3D Vault Visualization */}
                        <div className="flex-1 flex justify-center lg:justify-end perspective-1000 -mt-16">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                transition={{ duration: 1, delay: 0.2 }}
                            >
                                <Vault3D />
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Bottom decorative fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-surface/30 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                            Why Choose <span className="text-primary">Cipher Drop</span>?
                        </h2>
                        <p className="text-text-muted max-w-2xl mx-auto">
                            Your privacy is our priority. We've built security into every layer of our platform.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                hover
                                glow
                                padding="lg"
                                className="text-center group relative overflow-hidden"
                            >
                                {/* Gradient overlay on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                <div className="relative z-10">
                                    <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                                        <feature.icon size={32} className="text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-text mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-text-muted">
                                        {feature.description}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                            How It Works
                        </h2>
                        <p className="text-text-muted max-w-2xl mx-auto">
                            Secure file sharing in three simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            { step: '01', icon: Upload, title: 'Upload', desc: 'Select your file and optionally set a password' },
                            { step: '02', icon: Lock, title: 'Encrypt', desc: 'Your browser encrypts the file before upload' },
                            { step: '03', icon: Globe, title: 'Share', desc: 'Get a secure link to share with anyone' },
                        ].map((item, index) => (
                            <div key={index} className="relative group">
                                {/* Connector line for desktop */}
                                {index < 2 && (
                                    <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                                )}

                                <div className="flex flex-col items-center text-center">
                                    <div className="text-6xl font-bold text-primary/20 mb-4 group-hover:text-primary/30 transition-colors">
                                        {item.step}
                                    </div>
                                    <div className="p-3 rounded-xl bg-surface border border-border mb-4 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all">
                                        <item.icon size={24} className="text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-text mb-2">{item.title}</h3>
                                    <p className="text-text-muted text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Only for non-logged in users */}
            {!user && (
                <section className="py-20 relative overflow-hidden">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />
                    <div className="absolute inset-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
                    </div>

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-6 animate-bounce-slow">
                            <Zap size={32} className="text-primary" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                            Ready to Share Securely?
                        </h2>
                        <p className="text-text-muted max-w-xl mx-auto mb-8">
                            Start protecting your files today with military-grade encryption.
                            No account required for basic sharing.
                        </p>
                        <Link to="/register">
                            <Button size="lg" icon={ArrowRight} iconPosition="right" className="shadow-lg shadow-primary/25">
                                Get Started Free
                            </Button>
                        </Link>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="relative z-20 bg-background py-8 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Shield className="text-primary" size={20} />
                            <span className="text-text-muted font-medium">Cipher Drop</span>
                        </div>
                        <p className="text-text-dim text-sm">
                            © 2024 Cipher Drop. Your files, your privacy.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Custom CSS for animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float { animation: float 3s ease-in-out infinite; }
                .animate-blob { animation: blob 7s ease-in-out infinite; }
                .animate-gradient { animation: gradient 3s ease infinite; }
                .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
                .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
};

export default LandingPage;
