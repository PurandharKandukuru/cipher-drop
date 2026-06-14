/**
 * Login Page
 * User authentication with email and password - Connected to Backend
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button, Input, Card, GoogleSignInButton } from '../components';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    // Redirect to the dashboard once authentication completes (covers both
    // email/password and Google popup; avoids navigating before auth is ready).
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        setApiError('');
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setApiError('');

        try {
            await login(formData.email, formData.password);
            // Redirect handled by the isAuthenticated effect above.
        } catch (error) {
            let message = 'Login failed. Please try again.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                message = 'Invalid email or password.';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Too many attempts. Please try again later.';
            } else if (error.message) {
                message = error.message;
            }
            setApiError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = () => {
        // Firebase auth state change flips isAuthenticated → the effect redirects.
        setApiError('');
    };

    const handleGoogleError = (error) => {
        setApiError(error || 'Google Sign-In failed. Please try again.');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 p-4">
                <Link to="/" className="inline-flex items-center gap-2 group">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Shield className="text-primary" size={24} />
                    </div>
                    <span className="text-xl font-bold text-text">Cipher Drop</span>
                </Link>
            </header>

            {/* Main content */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Card padding="lg" variant="elevated">
                        <div className="text-center mb-8">
                            <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-4">
                                <Lock className="text-primary" size={28} />
                            </div>
                            <h1 className="text-2xl font-bold text-text mb-2">Welcome Back</h1>
                            <p className="text-text-muted">Sign in to access your secure files</p>
                        </div>

                        {/* API Error */}
                        {apiError && (
                            <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                                {apiError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                type="email"
                                name="email"
                                label="Email Address"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                                icon={Mail}
                                required
                            />

                            <Input
                                type="password"
                                name="password"
                                label="Password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                icon={Lock}
                                required
                            />

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary focus:ring-offset-0"
                                    />
                                    <span className="text-sm text-text-muted">Remember me</span>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                loading={isLoading}
                                icon={ArrowRight}
                                iconPosition="right"
                            >
                                Sign In
                            </Button>
                        </form>

                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-text-dim text-sm">or continue with</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        {/* Google Sign-In */}
                        <GoogleSignInButton
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                        />

                        <p className="text-center text-text-muted mt-6">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary hover:text-primary-light font-medium transition-colors">
                                Create one
                            </Link>
                        </p>
                    </Card>

                    <p className="text-center text-text-dim text-xs mt-6 flex items-center justify-center gap-1">
                        <Shield size={12} />
                        Protected with end-to-end encryption
                    </p>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
