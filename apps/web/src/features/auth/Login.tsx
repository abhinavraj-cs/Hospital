import { useState } from 'react';
import { useAuthStore } from './authStore';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data = await response.json();
      login(data.user, data.tokens);
      
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white border rounded-[20px] shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center mx-auto mb-4 shadow-sm text-2xl font-bold">
            C
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Sign in to your CityCare account</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@citycare.com"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium mt-6 hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
