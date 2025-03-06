import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/user-menu';
import { Calendar, CheckSquare, Users } from 'lucide-react';

export default function Layout({ children, user, onSignOut }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">Todo Manager</h1>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex items-center space-x-1">
                <Link to="/">
                  <Button variant={isActive('/') ? 'default' : 'ghost'}>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    My Todos
                  </Button>
                </Link>
                <Link to="/all">
                  <Button variant={isActive('/all') ? 'default' : 'ghost'}>
                    <Users className="h-4 w-4 mr-2" />
                    All Todos
                  </Button>
                </Link>
                <Link to="/calendar">
                  <Button variant={isActive('/calendar') ? 'default' : 'ghost'}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                </Link>
              </nav>
              <UserMenu user={user} onSignOut={onSignOut} />
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4">
          <div className="flex justify-around">
            <Link to="/">
              <Button variant="ghost" className={isActive('/') ? 'bg-gray-100' : ''}>
                <CheckSquare className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/all">
              <Button variant="ghost" className={isActive('/all') ? 'bg-gray-100' : ''}>
                <Users className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/calendar">
              <Button variant="ghost" className={isActive('/calendar') ? 'bg-gray-100' : ''}>
                <Calendar className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
