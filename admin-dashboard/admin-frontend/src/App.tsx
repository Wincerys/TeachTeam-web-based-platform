// src/App.tsx
import React, { useState, useEffect } from 'react';
import { ApolloProvider, useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  Users, 
  BookOpen, 
  UserCheck, 
  LogOut, 
  Shield,
  FileText
} from 'lucide-react';
import { User, LoginCredentials } from './types';

// Import page components
import UserManagement from './pages/UserManagement';
import CourseManagement from './pages/CourseManagement';
import LecturerAssignments from './pages/LecturerAssignments';
import Reports from './pages/Reports';

// Apollo Client Setup
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('admin-token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all'
    },
    query: {
      errorPolicy: 'all'
    }
  }
});

// GraphQL Operations
const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        firstName
        lastName
        username
        email
        role
      }
    }
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      firstName
      lastName
      username
      email
      role
      isBlocked
      createdAt
    }
  }
`;

// Login Component
interface LoginComponentProps {
  onLogin: (user: User) => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({ username: '', password: '' });
  const [error, setError] = useState<string>('');
  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const { data } = await login({ variables: credentials });
      localStorage.setItem('admin-token', data.login.token);
      onLogin(data.login.user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-screen w-full">
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Sign in to access the admin panel</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Default credentials:</p>
          <p><strong>Username:</strong> admin</p>
          <p><strong>Password:</strong> admin</p>
        </div>
      </div>
    </div>
    </div>
  );
};

// Main Dashboard Component
interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>('users');

  const tabs = [
    { id: 'users', name: 'User Management', icon: Users, component: UserManagement },
    { id: 'courses', name: 'Course Management', icon: BookOpen, component: CourseManagement },
    { id: 'assignments', name: 'Lecturer Assignments', icon: UserCheck, component: LecturerAssignments },
    { id: 'reports', name: 'Reports', icon: FileText, component: Reports },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || UserManagement;

  return (
    <div className="w-screen min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">TeachTeam Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-700 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Page Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

// Main App Component
const AdminApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    if (token) {
      // Verify token and get user info
      client.query({ query: ME_QUERY })
        .then(({ data }) => {
          if (data.me) {
            setUser(data.me);
          } else {
            localStorage.removeItem('admin-token');
          }
        })
        .catch(() => {
          localStorage.removeItem('admin-token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <LoginComponent onLogin={handleLogin} />
      )}
    </div>
  );
};

// Main App with Apollo Provider
const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <AdminApp />
    </ApolloProvider>
  );
};

export default App;