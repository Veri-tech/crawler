'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { createClient } from '@/lib/supabase/client';

interface AuthFormValues {
  email: string;
  password: string;
  display_name?: string;
}

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>();

  const onSubmit = async (data: AuthFormValues) => {
    setSubmitting(true);
    setFormError(null);
    const supabase = createClient();

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { display_name: data.display_name || '' },
          },
        });
        if (error) throw error;
      }

      toast.success(mode === 'login' ? 'Signed in successfully' : 'Account created — check your email to confirm');
      router.push('/');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-8">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2">
        <AppLogo size={28} />
        <span className="font-semibold text-foreground">VeriCrawl</span>
      </div>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          {mode === 'login' ? 'Sign in to VeriCrawl' : 'Create your account'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          {mode === 'login' ?'Enter your credentials to access your dashboard.' :'Start crawling in under a minute.'}
        </p>
      </div>

      {/* Form error banner */}
      {formError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/25 text-sm text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {/* Display name — signup only */}
        {mode === 'signup' && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="display_name" className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              Display Name
            </label>
            <input
              id="display_name"
              type="text"
              className="input-base"
              placeholder="Jane Doe"
              {...register('display_name', {
                required: mode === 'signup' ? 'Display name is required' : false,
              })}
            />
            {errors.display_name && (
              <p className="text-xs text-red-400">{errors.display_name.message}</p>
            )}
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input-base"
            placeholder="you@company.com"
            autoComplete="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              Password
            </label>
            {mode === 'login' && (
              <button type="button" className="text-xs text-primary hover:underline">
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="input-base pr-10"
              placeholder={mode === 'signup' ? 'Min 8 characters' : '••••••••'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              {...register('password', {
                required: 'Password is required',
                minLength:
                  mode === 'signup'
                    ? { value: 8, message: 'Password must be at least 8 characters' }
                    : undefined,
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
          {mode === 'signup' && (
            <p className="text-xs text-muted-foreground">
              Use at least 8 characters with a mix of letters and numbers.
            </p>
          )}
        </div>

        {/* Remember me */}
        {mode === 'login' && (
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border bg-input accent-primary"
            />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              Remember me for 30 days
            </span>
          </label>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full justify-center py-2.5 mt-1"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              {mode === 'login' ? 'Signing in…' : 'Creating account…'}
            </>
          ) : (
            <>
              {mode === 'login' ? 'Sign in' : 'Create account'}
              <ArrowRight size={15} />
            </>
          )}
        </button>

        {/* TOS — signup only */}
        {mode === 'signup' && (
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            By creating an account you agree to our{' '}
            <Link href="/" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        )}
      </form>

      {/* Mode toggle */}
      <p className="text-sm text-muted-foreground text-center">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setFormError(null); }}
          className="text-primary hover:underline font-medium"
        >
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}