import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const persistAuthSession = (authPayload) => {
    const { token: authToken, ...userData } = authPayload;
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authToken);
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!token && !!user;
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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        verifyLoginOtp,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated,
        updateUserProfileImage,
        deleteUserProfileImage,
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
