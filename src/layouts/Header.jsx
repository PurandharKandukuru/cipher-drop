/**
 * Header Component - With Theme Toggle
 */
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Header = ({ isAuthenticated: propAuth, user: propUser, onLogout: propLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Auth context (always available via AuthProvider in App.jsx)
    const authContext = useAuth();

    const isAuthenticated = authContext?.isAuthenticated ?? propAuth ?? false;
    const user = authContext?.user ?? propUser;
    const logout = authContext?.logout ?? propLogout;

    // Theme context (always available via ThemeProvider in App.jsx)
    const { toggleTheme, isDark } = useTheme();

    const handleLogout = () => {
        logout?.();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Shield className="text-primary" size={24} />
                        </div>
                        <span className="text-xl font-bold text-text hidden sm:block">Cipher Drop</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard">
                                    <Button variant="ghost" size="sm">Dashboard</Button>
                                </Link>
                                <Link to="/upload">
                                    <Button variant="ghost" size="sm">Upload</Button>
                                </Link>
                                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                            <User size={16} className="text-primary" />
                                        </div>
                                        <span className="text-sm text-text-muted">{user?.email || 'User'}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout}>Logout</Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Login</Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" size="sm">Get Started</Button>
                                </Link>
                            </>
                        )}

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-all ml-2"
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </nav>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top duration-200">
                        <nav className="flex flex-col gap-2">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 text-text hover:bg-surface rounded-lg transition-colors">
                                        Dashboard
                                    </Link>
                                    <Link to="/upload" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 text-text hover:bg-surface rounded-lg transition-colors">
                                        Upload
                                    </Link>
                                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="px-4 py-2 text-left text-error hover:bg-surface rounded-lg transition-colors">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 text-text hover:bg-surface rounded-lg transition-colors">
                                        Login
                                    </Link>
                                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 text-primary font-medium hover:bg-surface rounded-lg transition-colors">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
