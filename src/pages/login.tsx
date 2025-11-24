import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setApiError(result.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Store authentication data
      const userData = {
        id: result.data.subscriber_id,
        email: formData.email,
        name: '', // Will be fetched from profile endpoint if needed
        subscriber_id: result.data.subscriber_id,
        tenant_id: result.data.tenant_id,
        tier: result.data.tier,
      };

      const tokens = {
        access_token: result.data.access_token,
        refresh_token: result.data.refresh_token,
        token_type: 'Bearer',
        expires_in: result.data.expires_in,
      };

      login(userData, tokens);

      // Fetch full profile data
      try {
        const profileResponse = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.data) {
            const updatedUser = {
              ...userData,
              name: profileData.data.name || '',
            };
            login(updatedUser, tokens);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }

      // Redirect to portal entry
      const redirectTo = router.query.redirect as string || '/app';
      router.push(redirectTo);
    } catch (error) {
      console.error('Login error:', error);
      setApiError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <>
      <Head>
        <title>Login - Sovren AI</title>
        <meta name="description" content="Sign in to your Sovren AI account" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Sovren AI
              </h1>
            </Link>
            <h2 className="text-2xl font-bold text-white mb-2">Log in to Sovren AI</h2>
            <p className="text-gray-400">Access your AI executive intelligence platform</p>
          </div>

          {/* Login Form */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* API Error */}
              {apiError && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  {apiError}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={cn(
                    'w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                    'transition-all duration-200',
                    errors.email ? 'border-red-500' : 'border-gray-700'
                  )}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={cn(
                    'w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                    'transition-all duration-200',
                    errors.password ? 'border-red-500' : 'border-gray-700'
                  )}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-400">Remember me</span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full py-3 px-4 rounded-lg font-semibold text-white',
                  'bg-gradient-to-r from-indigo-600 to-purple-600',
                  'hover:from-indigo-700 hover:to-purple-700',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Signup Link */}
            <div className="mt-6 text-center text-sm text-gray-400">
              Need an account?{' '}
              <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Start a trial
              </Link>
            </div>
          </div>

          {/* Demo Link */}
          <div className="mt-6 text-center">
            <Link
              href="/demo"
              className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              Try the voice demo without signing in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
