import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserProfileService } from '@/services/userProfile';
import { useEffect } from 'react';

export const useAuth = () => {
  const [user, loading, error] = useAuthState(auth);

  // Create or update user profile when authenticated
  useEffect(() => {
    if (user && !loading) {
      UserProfileService.createOrUpdateProfile(user.uid, {
        email: user.email!,
        displayName: user.displayName || 'Anonymous User',
        photoURL: user.photoURL || undefined
      }).catch(error => {
        console.error('Failed to create/update user profile:', error);
      });
    }
  }, [user, loading]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
  };
};
