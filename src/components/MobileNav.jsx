/**
 * Mobile Bottom Navigation
 * Sticky navigation bar for mobile devices
 */
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, FolderOpen, User } from 'lucide-react';

const MobileNav = () => {
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', icon: Home, label: 'Home' },
        { path: '/upload', icon: Upload, label: 'Upload' },
        { path: '/dashboard', icon: FolderOpen, label: 'Files', hash: '#files' },
        { path: '/dashboard', icon: User, label: 'Profile', hash: '#profile' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/95 backdrop-blur-lg border-t border-border safe-area-bottom">
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item, index) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${active
                                    ? 'text-primary bg-primary/10'
                                    : 'text-text-muted hover:text-text'
                                }`}
                        >
                            <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                            <span className="text-xs font-medium">{item.label}</span>
                            {active && (
                                <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Safe area spacing for iOS */}
            <style>{`
                .safe-area-bottom {
                    padding-bottom: env(safe-area-inset-bottom, 0);
                }
            `}</style>
        </nav>
    );
};

export default MobileNav;
