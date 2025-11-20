import React from 'react';
import { LayoutDashboard, User, LogOut, Map, Shield, Briefcase } from 'lucide-react';
import { UserType } from '../types';

interface NavbarProps {
  userType: UserType | null;
  onLogout: () => void;
  onSwitchView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userType, onLogout, onSwitchView }) => {
  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0 start-0">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer" onClick={() => onSwitchView('landing')}>
          <div className="bg-red-600 p-1.5 rounded-lg">
            <Map className="h-6 w-6 text-white" />
          </div>
          <span className="self-center text-2xl font-bold whitespace-nowrap text-gray-900">ImmiPlanner AI</span>
        </div>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          {userType ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden md:block">
                Logged in as <span className="font-semibold text-red-600">{userType === 'SuperAdmin' ? 'Super Admin' : userType}</span>
              </span>
              <button
                onClick={onLogout}
                className="text-white bg-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onSwitchView('partner-login')}
                    className="text-gray-600 hover:text-gray-900 font-medium text-sm px-3 py-2 flex items-center gap-1"
                >
                   <Briefcase size={16} /> Partner Login
                </button>
                {/* Hidden/Subtle Admin Login for Demo purposes */}
                <button 
                    onClick={() => onSwitchView('super-admin-login')}
                    className="text-gray-400 hover:text-gray-600 font-medium text-sm px-3 py-2"
                >
                   Admin
                </button>
                <button
                type="button"
                className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
                >
                Get Started
                </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};