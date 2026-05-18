import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithFace: () => Promise<void>;
  signOut: () => Promise<void>;
  connectGoogleCalendar: () => Promise<void>;
  disconnectGoogleCalendar: () => void;
  connectOutlookCalendar: () => Promise<void>;
  disconnectOutlookCalendar: () => void;
  googleAccessToken: string | null;
  outlookAccessToken: string | null;
  isCalendarConnected: boolean;
  isOutlookConnected: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithGithub: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithFace: async () => {},
  signOut: async () => {},
  connectGoogleCalendar: async () => {},
  disconnectGoogleCalendar: () => {},
  connectOutlookCalendar: async () => {},
  disconnectOutlookCalendar: () => {},
  googleAccessToken: null,
  outlookAccessToken: null,
  isCalendarConnected: false,
  isOutlookConnected: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(localStorage.getItem('google_calendar_token'));
  const [outlookAccessToken, setOutlookAccessToken] = useState<string | null>(localStorage.getItem('outlook_calendar_token'));
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean>(!!localStorage.getItem('google_calendar_token'));
  const [isOutlookConnected, setIsOutlookConnected] = useState<boolean>(!!localStorage.getItem('outlook_calendar_token'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email || 'face-login@lifeflow.app',
            displayName: user.displayName || user.email?.split('@')[0] || 'Face User',
            photoURL: user.photoURL,
            lastLogin: new Date().toISOString()
          }, { merge: true });
        } catch (error) {
          console.error("Error saving user to Firestore:", error);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleAuthError = (error: any, providerName: string) => {
    if (error.code === 'auth/operation-not-allowed') {
      const msg = `${providerName} is not enabled in Firebase Console. Go to Authentication > Sign-in method to enable it.`;
      console.error(msg);
      alert(msg);
    } else if (error.code === 'auth/popup-closed-by-user') {
      console.warn(`${providerName} login cancelled by user.`);
    } else {
      console.error(`Error with ${providerName}:`, error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      handleAuthError(error, 'Google');
    }
  };

  const connectGoogleCalendar = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar');
    
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (token) {
        setGoogleAccessToken(token);
        setIsCalendarConnected(true);
        localStorage.setItem('google_calendar_token', token);
      }
    } catch (error: any) {
      handleAuthError(error, 'Google Calendar');
    }
  };

  const disconnectGoogleCalendar = () => {
    setGoogleAccessToken(null);
    setIsCalendarConnected(false);
    localStorage.removeItem('google_calendar_token');
  };

  const connectOutlookCalendar = async () => {
    const { OAuthProvider } = await import('firebase/auth');
    const provider = new OAuthProvider('microsoft.com');
    provider.addScope('Calendars.ReadWrite');
    provider.addScope('offline_access');
    provider.addScope('openid');
    provider.addScope('profile');
    
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = OAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (token) {
        setOutlookAccessToken(token);
        setIsOutlookConnected(true);
        localStorage.setItem('outlook_calendar_token', token);
      }
    } catch (error: any) {
      handleAuthError(error, 'Outlook Calendar (Microsoft)');
    }
  };

  const disconnectOutlookCalendar = () => {
    setOutlookAccessToken(null);
    setIsOutlookConnected(false);
    localStorage.removeItem('outlook_calendar_token');
  };

  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      handleAuthError(error, 'GitHub');
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      handleAuthError(error, 'Email Sign-in');
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      handleAuthError(error, 'Email Sign-up');
    }
  };

  const signInWithFace = async () => {
    try {
      const faceEmail = 'face-login@lifeflow.app';
      const facePass = 'LifeFlowFaceAuth2026!'; // Secure internal password
      
      try {
        // Try to sign in first
        await signInWithEmailAndPassword(auth, faceEmail, facePass);
      } catch (signInErr: any) {
        // If user doesn't exist, create it
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          await createUserWithEmailAndPassword(auth, faceEmail, facePass);
        } else {
          throw signInErr;
        }
      }
    } catch (error) {
      console.error('Error signing in with Face:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithGoogle, 
      signInWithGithub,
      signInWithEmail,
      signUpWithEmail,
      signInWithFace,
      signOut,
      connectGoogleCalendar,
      disconnectGoogleCalendar,
      connectOutlookCalendar,
      disconnectOutlookCalendar,
      googleAccessToken,
      outlookAccessToken,
      isCalendarConnected,
      isOutlookConnected
    }}>
      {children}
    </AuthContext.Provider>
  );
};
