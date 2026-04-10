import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import TechnicianDashboard from './TechnicianDashboard';
import UserDashboard from './UserDashboard';
import ManagerDashboard from  './ManagerDashboard';


const Dashboard = () => {
  const { user } = useAuth();

  const roleKey = useMemo(() => (user?.role || 'USER').toUpperCase(), [user?.role]);

  // Route to appropriate dashboard based on role
  switch (roleKey) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'TECHNICIAN':
      return <TechnicianDashboard />;
    case 'MANAGER':
      return <ManagerDashboard />;
    case 'STUDENT':
    case 'USER':
    default:
      return <UserDashboard />;
  }
};

export default Dashboard;
