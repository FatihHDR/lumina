"use client"

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon } from 'lucide-react'
import { SignInPage } from '@/components/sign-in'

interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
}

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

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleEscape)
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
        }
    }, [isOpen, onClose])

    const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email');
        const password = formData.get('password');

        console.log("Sign In:", { email, password });

        // Here you would call your auth service
        // For now, just close the modal
        onClose();
    };

    const handleGoogleSignIn = () => {
        console.log("Google Sign In clicked");
        // Implement Google OAuth here
    };

    const handleResetPassword = () => {
        console.log("Reset password clicked");
        // Implement password reset
    };

    const handleCreateAccount = () => {
        console.log("Create account clicked");
        // Navigate to signup or open signup modal
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[300]"
                    style={{
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>

                    {/* Sign In Component */}
                    <div className="w-full h-full">
                        <SignInPage
                            title={<span className="font-light text-foreground tracking-tighter">Welcome to LUMINA</span>}
                            description="Access your account and continue your creative journey"
                            heroImageSrc="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=2160&q=80"
                            testimonials={sampleTestimonials}
                            onSignIn={handleSignIn}
                            onGoogleSignIn={handleGoogleSignIn}
                            onResetPassword={handleResetPassword}
                            onCreateAccount={handleCreateAccount}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
