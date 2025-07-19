import { useAuth } from '@/hooks/useAuth';
import { PlayIcon } from '@heroicons/react/24/outline';

export const Auth = () => {
  const { user, loading, signInWithGoogle, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="glass-panel max-w-md w-full mx-4 text-center p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white flex items-center justify-center">
            <PlayIcon className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PlaylistPro</h1>
          <p className="text-gray-400 mb-8">
            Your YouTube playlist progress tracker
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full bg-white hover:bg-gray-100 text-black py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
