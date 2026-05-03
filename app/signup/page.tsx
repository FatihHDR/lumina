"use client"

import { SignInPage } from '@/components/sign-in'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { register } from '@/lib/services/auth'

const sampleTestimonials = [
    {
        avatarSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
        name: "Emily Rodriguez",
        handle: "@emilydesigns",
        text: "The onboarding process was incredibly smooth. I was up and running in minutes!"
    },
    {
        avatarSrc: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
        name: "Alex Thompson",
        handle: "@alexcodes",
        text: "Best decision I made this year. The platform is intuitive and powerful."
    },
    {
        avatarSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
        name: "Jessica Park",
        handle: "@jessicamarketing",
        text: "Finally, a platform that understands what creators need. Highly recommended!"
    },
];

export default function SignUpPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // For signup, we need name field - but the component doesn't have it yet
        // We'll extract from email for now
        const name = email.split('@')[0];

        if (!email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            // Call actual auth service for registration
            const response = await register({ name, email, password });

            console.log("Registration successful:", response);

            // Redirect to sign in page after successful registration
            router.push('/signin');
        } catch (err: any) {
            console.error("Registration error:", err);
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        console.log("Google Sign Up clicked");
        alert("Google OAuth integration coming soon!");
        // TODO: Implement Google OAuth here
    };

    const handleResetPassword = () => {
        // Not applicable for signup
    };

    const handleSignIn = () => {
        router.push('/signin');
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
                        <span className="font-light text-foreground tracking-tighter">Creating account...</span>
                    ) : (
                        <span className="font-light text-foreground tracking-tighter">Join LUMINA</span>
                    )
                }
                description="Create your account and start your creative journey today"
                heroImageSrc="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=2160&q=80"
                testimonials={sampleTestimonials}
                onSignIn={handleSignUp}
                onGoogleSignIn={handleGoogleSignUp}
                onResetPassword={handleResetPassword}
                onCreateAccount={handleSignIn}
            />
        </div>
    );
}
