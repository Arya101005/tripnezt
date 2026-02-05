import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

const PRIMARY_ADMIN_EMAIL = 'Admin@tripnezt.in';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      // Fetch user profile from Firestore
      let profile = await fetchUserProfile(firebaseUser.uid);
      
      // Retry a few times if doc missing (signUp may have just written it)
      for (let i = 0; i < 3 && !profile; i++) {
        await new Promise((r) => setTimeout(r, 500));
        profile = await fetchUserProfile(firebaseUser.uid);
      }

      // If still no profile after retries, create one
      if (!profile) {
        const basicProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          role: 'user',
          status: 'active',
          phoneNumber: '',
          createdAt: new Date().toISOString(),
        };
        
        // Try to save it without waiting
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), basicProfile);
          profile = basicProfile;
        } catch (err) {
          // If saving fails, use the basic profile anyway
          console.error('Error creating user profile:', err);
          profile = basicProfile;
        }
      }
      
      setUserProfile(profile);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, { name, phoneNumber, applyAsAdmin }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;
    const isPrimaryAdmin = email.toLowerCase() === PRIMARY_ADMIN_EMAIL;
    const role = applyAsAdmin ? 'admin' : 'user';
    const status = applyAsAdmin
      ? (isPrimaryAdmin ? 'approved' : 'pending')
      : 'active';
    
    const userData = {
      uid,
      name: name || '',
      email,
      role,
      status,
      phoneNumber: phoneNumber || '',
      createdAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, 'users', uid), userData);
    setUserProfile({ id: uid, ...userData });
    return credential;
  };

  const signIn = async (email, password) => {
    // Check if trying to login as admin with non-primary email
    const isPrimaryAdmin = email.toLowerCase() === PRIMARY_ADMIN_EMAIL;
    
    // First do the authentication
    const credential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check user profile for admin status
    const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
    if (userDoc.exists()) {
      const profile = userDoc.data();
      if (profile.role === 'admin' && profile.status !== 'approved' && !isPrimaryAdmin) {
        await firebaseSignOut(auth);
        throw { code: 'auth/admin-not-approved', message: 'Your admin account is pending approval. Please contact the primary admin.' };
      }
    }
    
    return credential;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profile = await fetchUserProfile(user.uid);
    if (profile) setUserProfile(profile);
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
