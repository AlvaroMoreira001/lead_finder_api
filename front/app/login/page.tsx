'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, login, register } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      const message = await register(email, password);
      setSuccess(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-card border border-border rounded-2xl p-8 md:p-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-extrabold text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Lead Finder
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Captação inteligente de leads
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <h2 className="font-heading font-bold text-xl text-foreground">
            Acessar conta
          </h2>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className={cn(
                "w-full px-4 py-3 rounded-lg bg-input border border-border",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                "transition-all"
              )}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={4}
              className={cn(
                "w-full px-4 py-3 rounded-lg bg-input border border-border",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                "transition-all"
              )}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-heading font-bold text-sm",
                "bg-gradient-to-r from-primary to-[#7c6cf7] text-primary-foreground",
                "hover:opacity-90 hover:-translate-y-0.5 transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                "flex items-center justify-center gap-2"
              )}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Entrar
            </button>
            <button
              type="button"
              onClick={handleRegister}
              disabled={isLoading}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-heading font-bold text-sm",
                "bg-gradient-to-r from-primary to-[#7c6cf7] text-primary-foreground",
                "hover:opacity-90 hover:-translate-y-0.5 transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                "flex items-center justify-center gap-2"
              )}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Cadastrar
            </button>
          </div>

          {/* Messages */}
          {error && (
            <p className="text-sm text-destructive animate-fade-in-up text-center">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-success animate-fade-in-up text-center">
              {success}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
