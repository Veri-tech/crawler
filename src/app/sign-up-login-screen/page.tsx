import React from 'react';
import AuthForm from './components/AuthForm';
import AuthBrandPanel from './components/AuthBrandPanel';

export default function SignUpLoginPage() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left brand panel */}
      <AuthBrandPanel />
      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 min-h-screen">
        <AuthForm />
      </div>
    </div>
  );
}