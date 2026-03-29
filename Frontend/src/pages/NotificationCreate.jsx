import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { notificationAPI, userAPI } from '../services/api';

const NotificationCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles] = useState(['ADMIN', 'TEACHER', 'STUDENT', 'TECHNICIAN', 'MANAGER']);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'INFO',
    actionUrl: '',
    audienceType: 'ALL_USERS',
    roles: [],
    userIds: [],
  });

  // Check if user has permission
  useEffect(() => {
    if (user && !['ADMIN', 'TEACHER', 'TECHNICIAN'].includes(user.role)) {
      toast.error('You do not have permission to create notifications');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch all active users for specific user selection
  useEffect(() => {
    if (formData.audienceType === 'SPECIFIC_USERS') {
      fetchUsers();
    }
  }, [formData.audienceType]);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getActiveUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
 console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleToggle = (role) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleUserToggle = (userId) => {
    setFormData((prev) => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter((id) => id !== userId)
        : [...prev.userIds, userId],
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Notification title is required');
      return false;
    }
    if (!formData.message.trim()) {
      toast.error('Notification message is required');
      return false;
    }
    if (formData.title.length > 150) {
      toast.error('Title cannot exceed 150 characters');
      return false;
    }
    if (formData.message.length > 1200) {
      toast.error('Message cannot exceed 1200 characters');
      return false;
    }
    if (formData.actionUrl && formData.actionUrl.length > 255) {
      toast.error('Action URL cannot exceed 255 characters');
      return false;
    }
    if (formData.audienceType === 'SPECIFIC_ROLE' && formData.roles.length === 0) {
      toast.error('Please select at least one role');
      return false;
    }
    if (formData.audienceType === 'SPECIFIC_USERS' && formData.userIds.length === 0) {
      toast.error('Please select at least one user');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        actionUrl: formData.actionUrl.trim() || null,
        audienceType: formData.audienceType,
      };

      if (formData.audienceType === 'SPECIFIC_ROLE') {
        payload.roles = formData.roles;
      } else if (formData.audienceType === 'SPECIFIC_USERS') {
        payload.userIds = formData.userIds;
      }

      const response = await notificationAPI.createByAudience(payload);

      toast.success(`Successfully created ${response.data.count} notification(s)`);
      setFormData({
        title: '',
        message: '',
        type: 'INFO',
        actionUrl: '',
        audienceType: 'ALL_USERS',
        roles: [],
        userIds: [],
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create notification';
      toast.error(errorMessage);
      console.error('Error creating notification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Create Notification</h1>
            <p className="text-blue-100 mt-2">Send notifications to your campus community</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Notification Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter notification title"
                maxLength="150"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.title.length}/150 characters
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter notification message"
                maxLength="1200"
                rows="4"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.message.length}/1200 characters
              </p>
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Notification Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['INFO', 'SUCCESS', 'WARNING', 'ERROR'].map((notifType) => (
                  <button
                    key={notifType}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: notifType }))
                    }
                    className={`py-2 px-3 rounded-lg font-medium text-sm transition ${
                      formData.type === notifType
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    disabled={loading}
                  >
                    {notifType}
                  </button>
                ))}
              </div>
            </div>

            {/* Action URL (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Action URL (Optional)
              </label>
              <input
                type="url"
                name="actionUrl"
                value={formData.actionUrl}
                onChange={handleInputChange}
                placeholder="https://example.com"
                maxLength="255"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.actionUrl.length}/255 characters
              </p>
            </div>

            {/* Audience Type Selection */}
            <div className="bg-slate-50 rounded-xl p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Select Audience *
              </label>
              <div className="space-y-4">
                {/* All Users Option */}
                <label className="flex items-start cursor-pointer p-3 rounded-lg hover:bg-white transition">
                  <input
                    type="radio"
                    name="audienceType"
                    value="ALL_USERS"
                    checked={formData.audienceType === 'ALL_USERS'}
                    onChange={handleInputChange}
                    className="mt-1 mr-3"
                    disabled={loading}
                  />
                  <div>
                    <p className="font-medium text-slate-700">All Users</p>
                    <p className="text-sm text-slate-500">Send to all active users</p>
                  </div>
                </label>

                {/* Specific Role Option */}
                <div>
                  <label className="flex items-start cursor-pointer p-3 rounded-lg hover:bg-white transition">
                    <input
                      type="radio"
                      name="audienceType"
                      value="SPECIFIC_ROLE"
                      checked={formData.audienceType === 'SPECIFIC_ROLE'}
                      onChange={handleInputChange}
                      className="mt-1 mr-3"
                      disabled={loading}
                    />
                    <div>
                      <p className="font-medium text-slate-700">Specific Roles</p>
                      <p className="text-sm text-slate-500">Send to users with selected roles</p>
                    </div>
                  </label>

                  {formData.audienceType === 'SPECIFIC_ROLE' && (
                    <div className="ml-8 mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {roles.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleRoleToggle(role)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                            formData.roles.includes(role)
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-700 hover:border-blue-500'
                          }`}
                          disabled={loading}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Specific Users Option */}
                <div>
                  <label className="flex items-start cursor-pointer p-3 rounded-lg hover:bg-white transition">
                    <input
                      type="radio"
                      name="audienceType"
                      value="SPECIFIC_USERS"
                      checked={formData.audienceType === 'SPECIFIC_USERS'}
                      onChange={handleInputChange}
                      className="mt-1 mr-3"
                      disabled={loading}
                    />
                    <div>
                      <p className="font-medium text-slate-700">Specific Users</p>
                      <p className="text-sm text-slate-500">Send to selected individual users</p>
                    </div>
                  </label>

                  {formData.audienceType === 'SPECIFIC_USERS' && (
                    <div className="ml-8 mt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-4 bg-white">
                        {users.map((usr) => (
                          <button
                            key={usr.id}
                            type="button"
                            onClick={() => handleUserToggle(usr.id)}
                            className={`text-left p-2 rounded transition ${
                              formData.userIds.includes(usr.id)
                                ? 'bg-blue-100 border border-blue-500'
                                : 'bg-slate-100 border border-transparent hover:bg-slate-200'
                            }`}
                            disabled={loading}
                          >
                            <p className="font-medium text-sm text-slate-800">{usr.name}</p>
                            <p className="text-xs text-slate-600">{usr.email}</p>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {formData.userIds.length} user(s) selected
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Send Notification'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
                className="flex-1 bg-slate-200 text-slate-700 font-semibold py-3 rounded-lg hover:bg-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NotificationCreate;
