import React, { useState } from 'react';
import { User } from '../types';

interface LoginPageProps {
    onLoginSuccess: (user: Pick<User, 'name' | 'email'>) => void;
    onGuestLogin: () => void;
}

export default function LoginPage({ onLoginSuccess, onGuestLogin }: LoginPageProps): React.ReactElement {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (isLoginView) {
                // Login logic
                const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
                const user = storedUsers.find((u: any) => u.email === email && u.password === password);
                if (user) {
                    onLoginSuccess({ name: user.name, email: user.email });
                } else {
                    setError('Invalid email or password.');
                }
            } else {
                // Signup logic
                if (!name.trim() || !email.trim() || !password.trim()) {
                    setError('All fields are required.');
                    return;
                }
                const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
                if (storedUsers.some((u: any) => u.email === email)) {
                    setError('An account with this email already exists.');
                    return;
                }
                const newUser = { name, email, password, spudPoints: 0, badges: [] };
                storedUsers.push(newUser);
                localStorage.setItem('users', JSON.stringify(storedUsers));
                onLoginSuccess({ name, email });
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-4" style={{
            backgroundImage: `url('https://picsum.photos/seed/restaurantbg/1920/1080')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            <div className="relative z-10 w-full max-w-md bg-cream-100/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center transition-all duration-500">
                <h1 className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
                    Potato & Friends
                </h1>
                <p className="text-lg text-gray-700 mb-8">{isLoginView ? 'Welcome Back!' : 'Create Your Account'}</p>
                
                {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                    {!isLoginView && (
                         <div>
                            <label htmlFor="name" className="sr-only">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={isLoginView ? "current-password" : "new-password"}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-700 text-white font-bold py-3 rounded-lg transition-colors hover:bg-green-800"
                    >
                        {isLoginView ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-sm text-gray-600 mb-6">
                    {isLoginView ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-semibold text-orange-600 hover:underline">
                        {isLoginView ? 'Sign Up' : 'Login'}
                    </button>
                </p>

                <div className="relative flex items-center mb-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <button
                    onClick={onGuestLogin}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                    Continue as a Guest
                </button>
            </div>
        </div>
    );
}