import React from 'react';
import AuthForm from '@/components/auth-form';

export default function AuthPage({ onSignIn }) {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <AuthForm onSuccess={onSignIn} />
    </div>
  );
}
