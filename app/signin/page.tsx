"use client"

import { SignInPage } from '@/components/sign-in'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { login } from '@/lib/services/auth'

const sampleTestimonials = [
    {
        avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        name: "Sarah Chen",
        handle: "@sarahdigital",
        text: "Amazing platform! The user experience is seamless and the features are exactly what I needed."
    },
    {
        avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
        name: "Marcus Johnson",
        handle: "@marcustech",
        text: "This service has transformed how I work. Clean design, powerful features, and excellent support."
    },
    {
        avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
        name: "David Martinez",
        handle: "@davidcreates",
        text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful."
    },
];

export default function SignInPageRoute() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            // Call actual auth service
            const response = await login({ email, password });

            console.log("Login successful:", response);

            // Redirect to home after successful login
            router.push('/');
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        console.log("Google Sign In clicked");
        alert("Google OAuth integration coming soon!");
        // TODO: Implement Google OAuth here
    };

    const handleResetPassword = () => {
        console.log("Reset password clicked");
        alert("Password reset feature coming soon!");
        // TODO: Implement password reset
    };

    const handleCreateAccount = () => {
        router.push('/signup');
    };

    return (
        <div className="bg-background text-foreground">
            {error && (
                <div className="fixed top-4 right-4 z-50 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 max-w-md">
                    {error}
                </div>
            )}

            <SignInPage
                title={
                    loading ? (
                        <span className="font-light text-foreground tracking-tighter">Signing in...</span>
                    ) : (
                        <span className="font-light text-foreground tracking-tighter">Welcome to LUMINA</span>
                    )
                }
                description="Access your account and continue your creative journey"
                heroImageSrc="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=2160&q=80"
                testimonials={sampleTestimonials}
                onSignIn={handleSignIn}
                onGoogleSignIn={handleGoogleSignIn}
                onResetPassword={handleResetPassword}
                onCreateAccount={handleCreateAccount}
            />
        </div>
    );
}
