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

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token: authToken, ...userData } = response.data;
    
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setToken(authToken);
    setUser(userData);
    
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
