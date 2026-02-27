import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, UserPlus } from 'lucide-react';
import './AuthPage.css';

const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
});

const RegisterPage = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [showPwd, setShowPwd] = useState(false);
    const [apiError, setApiError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        setApiError('');
        try {
            await registerUser(data.email, data.password);
            navigate('/dashboard');
        } catch (err) {
            setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-in">
                <div className="auth-logo">
                    <Shield size={28} />
                </div>
                <h1 className="auth-title">Create your vault</h1>
                <p className="auth-subtitle">Start securing your data with DataFort</p>

                {apiError && <div className="auth-error">{apiError}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input className="input" type="email" placeholder="you@example.com" {...register('email')} />
                        {errors.email && <span className="form-error">{errors.email.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Master Password</label>
                        <div className="input-wrapper">
                            <input
                                className="input"
                                type={showPwd ? 'text' : 'password'}
                                placeholder="Minimum 8 characters"
                                {...register('password')}
                            />
                            <button type="button" className="input-eye" onClick={() => setShowPwd(!showPwd)}>
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <span className="form-error">{errors.password.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="Repeat your password"
                            {...register('confirm')}
                        />
                        {errors.confirm && <span className="form-error">{errors.confirm.message}</span>}
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                        <UserPlus size={16} />
                        {isSubmitting ? 'Creating vault…' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
