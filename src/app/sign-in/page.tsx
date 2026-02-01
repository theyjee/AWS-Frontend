"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ImageSlider } from "@/components/ui/image-slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chrome } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const images = [
    "/assets/slider-1.png",
    "/assets/slider-2.png",
    "/assets/slider-3.png",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="relative w-full h-screen min-h-[700px] flex items-center justify-center p-4">
      {/* Optimized Background Image using Next.js Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/aws-clean-notes-bg-optimized.png"
          alt="AWS Architecture Background"
          fill
          priority
          quality={85}
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/5 to-white/5"
          aria-hidden="true"
        />
      </div>
      
      <motion.div
        className="relative z-10 w-full max-w-5xl h-[700px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Left side: Image Slider */}
        <div className="hidden lg:block relative">
          <ImageSlider images={images} interval={4000} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-12 left-8 right-8 text-white z-10">
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-white/90">Continue your path to AWS mastery.</p>
          </div>
        </div>

        {/* Right side: Login Form */}
        <div className="w-full h-full bg-white text-gray-900 flex flex-col items-center justify-center p-8 md:p-12">
          <motion.div
            className="w-full max-w-sm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight mb-2 text-gray-900">
              Sign In
            </motion.h1>
            <motion.p variants={itemVariants} className="text-gray-600 mb-8">
              Enter your credentials to access your account.
            </motion.p>

            {error && (
              <motion.div 
                variants={itemVariants} 
                className="w-full mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="w-full mb-6">
              <Button 
                variant="outline" 
                className="w-full group transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98]"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <Chrome className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="relative mb-6 w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </motion.div>

            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-900">Password</Label>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full bg-black text-white hover:bg-gray-900" disabled={loading}>
                {loading ? 'Signing in...' : 'Log In'}
              </Button>
            </motion.form>

            <motion.p variants={itemVariants} className="text-center text-sm text-gray-600 mt-8">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Sign up
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}