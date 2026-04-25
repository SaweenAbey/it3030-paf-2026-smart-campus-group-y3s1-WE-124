import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await userAPI.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.log('No active session found via cookies');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const persistAuthSession = (authPayload) => {
    const { token: _, ...userData } = authPayload;
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    if (response.data?.token) {
      persistAuthSession(response.data);
    }
    return response.data;
  };
    
  const verifyLoginOtp = async (otpPayload) => {
    const response = await authAPI.verifyOtp(otpPayload);
    persistAuthSession(response.data);
    return response.data;
  };

  const loginWithGoogle = async (idToken) => {
    const response = await authAPI.googleAuth({ idToken });
    persistAuthSession(response.data);
    return response.data;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    return response.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const updateUserProfileImage = async (imageUrl) => {
    if (!user?.userId) return;
    
    const response = await userAPI.updateProfileImage(user.userId, imageUrl);
    const updatedUser = { ...user, profileImageUrl: response.data.profileImageUrl };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    return response.data;
  };

  const deleteUserProfileImage = async () => {
    if (!user?.userId) return;
    
    const response = await userAPI.deleteProfileImage(user.userId);
    const updatedUser = { ...user, profileImageUrl: null };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    return response.data;
  };

  const updateUser = async (id, userData) => {
    const response = await userAPI.updateProfile(id, userData);
    const updatedUser = { ...user, ...response.data };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verifyLoginOtp,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated,
        updateUserProfileImage,
        deleteUserProfileImage,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
