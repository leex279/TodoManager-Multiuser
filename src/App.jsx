import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/toast';
import Layout from '@/components/layout';
import MyTodos from '@/pages/my-todos';
import AllTodos from '@/pages/all-todos';
import CalendarPage from '@/pages/calendar-page';
import AuthPage from '@/pages/auth-page';
import { getCurrentUser } from '@/lib/supabase';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleSignIn = (user) => {
    setUser(user);
  };

  const handleSignOut = () => {
    setUser(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <ToastProvider>
      <Router>
        <Layout user={user} onSignOut={handleSignOut}>
          {user ? (
            <Routes>
              <Route path="/" element={<MyTodos user={user} />} />
              <Route path="/all" element={<AllTodos user={user} />} />
              <Route path="/calendar" element={<CalendarPage user={user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
            <AuthPage onSignIn={handleSignIn} />
          )}
        </Layout>
      </Router>
    </ToastProvider>
  );
}

export default App;
