import { useState } from 'react';
import { useAuthStore } from './authStore';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { authApi } from '../../services/api.service';

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
      const data = await authApi.login(email, password);
      if (!data?.user?.role || !data?.tokens?.accessToken) {
        throw new Error('Login response is missing user or token data');
      }

      login(data.user, data.tokens);
      
      toast.success('Successfully logged in!');
      
      // Navigate to role-specific dashboard
      const role = data.user.role;
      let dashboardPath = '/';
      switch (role) {
        case 'SUPER_ADMIN':
        case 'ADMIN':
          dashboardPath = '/admin';
          break;
        case 'DOCTOR':
          dashboardPath = '/doctor';
          break;
        case 'STAFF':
          dashboardPath = '/staff';
          break;
        case 'PATIENT':
        default:
          dashboardPath = '/patient';
          break;
      }
      navigate(dashboardPath);
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
          <img src="/logo-white.png" alt="ArogyaMitra Logo" className="w-16 h-16 rounded-xl object-cover mx-auto mb-4 shadow-sm" />
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Sign in to your ArogyaMitra account</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@ArogyaMitra.com"
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
