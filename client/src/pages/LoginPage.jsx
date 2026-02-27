import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import './AuthPage.css';

const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPwd, setShowPwd] = useState(false);
    const [apiError, setApiError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        setApiError('');
        try {
            await login(data.email, data.password);
            navigate('/dashboard');
        } catch (err) {
            setApiError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-in">
                <div className="auth-logo">
                    <Shield size={28} />
                </div>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to your DataFort vault</p>

                {apiError && <div className="auth-error">{apiError}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            className="input"
                            type="email"
                            placeholder="you@example.com"
                            {...register('email')}
                        />
                        {errors.email && <span className="form-error">{errors.email.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <input
                                className="input"
                                type={showPwd ? 'text' : 'password'}
                                placeholder="••••••••"
                                {...register('password')}
                            />
                            <button type="button" className="input-eye" onClick={() => setShowPwd(!showPwd)}>
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <span className="form-error">{errors.password.message}</span>}
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                        <LogIn size={16} />
                        {isSubmitting ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="auth-link">Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
