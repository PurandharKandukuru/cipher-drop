/**
 * Register Page
 * New user registration - Connected to Backend
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, UserPlus, Check } from 'lucide-react';
import { Button, Input, Card, GoogleSignInButton } from '../components';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();

    // Redirect once authentication completes (covers email + Google).
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const passwordRequirements = [
        { label: 'At least 8 characters', test: (p) => p.length >= 8 },
        { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
        { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
        { label: 'One number', test: (p) => /\d/.test(p) },
    ];

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
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
            await register(formData.email, formData.password);
            // Redirect handled by the isAuthenticated effect above.
        } catch (error) {
            let message = 'Registration failed. Please try again.';
            if (error.code === 'auth/email-already-in-use') {
                message = 'An account with this email already exists.';
            } else if (error.code === 'auth/weak-password') {
                message = 'Password is too weak. Please choose a stronger password.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Please enter a valid email address.';
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
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
            </div>

            <header className="relative z-10 p-4">
                <Link to="/" className="inline-flex items-center gap-2 group">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Shield className="text-primary" size={24} />
                    </div>
                    <span className="text-xl font-bold text-text">Cipher Drop</span>
                </Link>
            </header>

            <main className="relative z-10 flex-1 flex items-center justify-center p-4 py-8">
                <div className="w-full max-w-md">
                    <Card padding="lg" variant="elevated">
                        <div className="text-center mb-8">
                            <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-4">
                                <UserPlus className="text-primary" size={28} />
                            </div>
                            <h1 className="text-2xl font-bold text-text mb-2">Create Account</h1>
                            <p className="text-text-muted">Start sharing files securely today</p>
                        </div>

                        {apiError && (
                            <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                                {apiError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
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

                            <div>
                                <Input
                                    type="password"
                                    name="password"
                                    label="Password"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    icon={Lock}
                                    required
                                />

                                {formData.password && (
                                    <div className="mt-3 space-y-1">
                                        {passwordRequirements.map((req, index) => (
                                            <div
                                                key={index}
                                                className={`flex items-center gap-2 text-xs ${req.test(formData.password) ? 'text-success' : 'text-text-dim'
                                                    }`}
                                            >
                                                <Check size={12} />
                                                <span>{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Input
                                type="password"
                                name="confirmPassword"
                                label="Confirm Password"
                                placeholder="Repeat your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
                                icon={Lock}
                                success={formData.confirmPassword && formData.password === formData.confirmPassword}
                                required
                            />

                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 mt-0.5 rounded border-border bg-surface text-primary focus:ring-primary focus:ring-offset-0"
                                    required
                                />
                                <span className="text-sm text-text-muted">
                                    I agree to the{' '}
                                    <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
                                    and{' '}
                                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                                </span>
                            </label>

                            <Button type="submit" fullWidth size="lg" loading={isLoading}>
                                Create Account
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
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:text-primary-light font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </Card>

                    <div className="text-center mt-6 space-y-2">
                        <p className="text-text-dim text-xs flex items-center justify-center gap-1">
                            <Shield size={12} />
                            Your password is never stored on our servers
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;
