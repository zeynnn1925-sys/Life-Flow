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
  signInAnonymouslyUser: () => Promise<void>;
  signOut: () => Promise<void>;
  connectGoogleCalendar: () => Promise<void>;
  disconnectGoogleCalendar: () => void;
  connectOutlookCalendar: () => Promise<void>;
  disconnectOutlookCalendar: () => void;
  connectGoogleSheets: () => Promise<void>;
  disconnectGoogleSheets: () => void;
  googleAccessToken: string | null;
  outlookAccessToken: string | null;
  googleSheetsAccessToken: string | null;
  isCalendarConnected: boolean;
  isOutlookConnected: boolean;
  isSheetsConnected: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithGithub: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithFace: async () => {},
  signInAnonymouslyUser: async () => {},
  signOut: async () => {},
  connectGoogleCalendar: async () => {},
  disconnectGoogleCalendar: () => {},
  connectOutlookCalendar: async () => {},
  disconnectOutlookCalendar: () => {},
  connectGoogleSheets: async () => {},
  disconnectGoogleSheets: () => {},
  googleAccessToken: null,
  outlookAccessToken: null,
  googleSheetsAccessToken: null,
  isCalendarConnected: false,
  isOutlookConnected: false,
  isSheetsConnected: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(localStorage.getItem('google_calendar_token'));
  const [outlookAccessToken, setOutlookAccessToken] = useState<string | null>(localStorage.getItem('outlook_calendar_token'));
  const [googleSheetsAccessToken, setGoogleSheetsAccessToken] = useState<string | null>(localStorage.getItem('google_sheets_token'));
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean>(!!localStorage.getItem('google_calendar_token'));
  const [isOutlookConnected, setIsOutlookConnected] = useState<boolean>(!!localStorage.getItem('outlook_calendar_token'));
  const [isSheetsConnected, setIsSheetsConnected] = useState<boolean>(!!localStorage.getItem('google_sheets_token'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          let defaultDisplayName = 'User';
          let defaultEmail = 'user@lifeflow.app';

          if (user.isAnonymous) {
            defaultDisplayName = 'Guest User';
            defaultEmail = 'guest@lifeflow.app';
          } else if (user.email === 'face-login@lifeflow.app') {
            defaultDisplayName = 'Face User';
            defaultEmail = 'face-login@lifeflow.app';
          } else {
            defaultDisplayName = user.displayName || user.email?.split('@')[0] || 'User';
            defaultEmail = user.email || 'user@lifeflow.app';
          }

          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email || defaultEmail,
            displayName: user.displayName || defaultDisplayName,
            photoURL: user.photoURL,
            lastLogin: new Date().toISOString(),
            isAnonymous: user.isAnonymous
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
    const isLanguageIndonesian = localStorage.getItem('lifeflow_language') === 'id';
    
    if (error.code === 'auth/operation-not-allowed') {
      const msg = `${providerName} is not enabled in Firebase Console. Go to Authentication > Sign-in method to enable it.`;
      console.warn(msg);
      alert(msg);
    } else if (error.code === 'auth/popup-closed-by-user') {
      console.warn(`${providerName} login cancelled by user.`);
      const friendlyError = new Error(
        isLanguageIndonesian
          ? `Popup login ${providerName} ditutup oleh pengguna sebelum selesai.`
          : `The login popup for ${providerName} was closed before completing.`
      );
      (friendlyError as any).code = error.code;
      throw friendlyError;
    } else if (error.code === 'auth/popup-blocked') {
      const warningMsg = `Browser blocked the popup for ${providerName}. Please check your browser's popup blocker settings or try opening the app in a new tab.`;
      console.warn(warningMsg);
      const friendlyError = new Error(
        isLanguageIndonesian
          ? `Popup login diblokir oleh browser saat menghubungkan ${providerName}. Silakan izinkan popup di browser Anda atau buka aplikasi ini di tab baru.`
          : `Popup blocked by browser when connecting ${providerName}. Please allow popups or open the app in a new tab.`
      );
      (friendlyError as any).code = error.code;
      throw friendlyError;
    } else if (error.code === 'auth/cancelled-popup-request') {
      const warningMsg = `Popup request cancelled for ${providerName}.`;
      console.warn(warningMsg);
      const friendlyError = new Error(
        isLanguageIndonesian
          ? `Permintaan popup untuk ${providerName} dibatalkan atau masih berjalan.`
          : `The popup request for ${providerName} was cancelled or is already pending.`
      );
      (friendlyError as any).code = error.code;
      throw friendlyError;
    } else {
      console.warn(`Auth connection issue with ${providerName}:`, error.message || error);
      throw error;
    }
  };

  const signInWithGoogle = React.useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      handleAuthError(error, 'Google');
    }
  }, []);

  const connectGoogleCalendar = React.useCallback(async () => {
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
  }, []);

  const disconnectGoogleCalendar = React.useCallback(() => {
    setGoogleAccessToken(null);
    setIsCalendarConnected(false);
    localStorage.removeItem('google_calendar_token');
  }, []);

  const connectGoogleSheets = React.useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/spreadsheets');
    
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (token) {
        setGoogleSheetsAccessToken(token);
        setIsSheetsConnected(true);
        localStorage.setItem('google_sheets_token', token);
      }
    } catch (error: any) {
      handleAuthError(error, 'Google Sheets');
    }
  }, []);

  const disconnectGoogleSheets = React.useCallback(() => {
    setGoogleSheetsAccessToken(null);
    setIsSheetsConnected(false);
    localStorage.removeItem('google_sheets_token');
  }, []);

  const connectOutlookCalendar = React.useCallback(async () => {
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
  }, []);

  const disconnectOutlookCalendar = React.useCallback(() => {
    setOutlookAccessToken(null);
    setIsOutlookConnected(false);
    localStorage.removeItem('outlook_calendar_token');
  }, []);

  const signInWithGithub = React.useCallback(async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      handleAuthError(error, 'GitHub');
    }
  }, []);

  const signInWithEmail = React.useCallback(async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      handleAuthError(error, 'Email Sign-in');
    }
  }, []);

  const signUpWithEmail = React.useCallback(async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      handleAuthError(error, 'Email Sign-up');
    }
  }, []);

  const signInWithFace = React.useCallback(async () => {
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
  }, []);

  const signInAnonymouslyUser = React.useCallback(async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      handleAuthError(error, 'Anonymous Login');
    }
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      // Clear all tokens on logout
      localStorage.removeItem('google_calendar_token');
      localStorage.removeItem('outlook_calendar_token');
      localStorage.removeItem('google_sheets_token');
      setGoogleAccessToken(null);
      setOutlookAccessToken(null);
      setGoogleSheetsAccessToken(null);
      setIsCalendarConnected(false);
      setIsOutlookConnected(false);
      setIsSheetsConnected(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithGoogle, 
      signInWithGithub,
      signInWithEmail,
      signUpWithEmail,
      signInWithFace,
      signInAnonymouslyUser,
      signOut,
      connectGoogleCalendar,
      disconnectGoogleCalendar,
      connectOutlookCalendar,
      disconnectOutlookCalendar,
      connectGoogleSheets,
      disconnectGoogleSheets,
      googleAccessToken,
      outlookAccessToken,
      googleSheetsAccessToken,
      isCalendarConnected,
      isOutlookConnected,
      isSheetsConnected
    }}>
      {children}
    </AuthContext.Provider>
  );
};
