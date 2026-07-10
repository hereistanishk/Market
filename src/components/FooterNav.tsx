import React from 'react';
import { Home, Briefcase, MessageSquare, Package, Menu } from 'lucide-react';

interface FooterNavProps {
  appSection: string;
  setAppSection: (section: any) => void;
}

export function FooterNav({ appSection, setAppSection }: FooterNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe ">
      <div className="flex justify-around items-center h-16 px-1">
        <button 
          onClick={() => setAppSection('shop')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${appSection === 'shop' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Home className="w-6 h-6 mb-1" strokeWidth={appSection === 'shop' ? 2.5 : 2} />
          <span className="text-[10px] font-semibold tracking-wide">Home</span>
        </button>
        <button 
          onClick={() => setAppSection('freelance')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${appSection === 'freelance' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Briefcase className="w-6 h-6 mb-1" strokeWidth={appSection === 'freelance' ? 2.5 : 2} />
          <span className="text-[10px] font-semibold tracking-wide">Freelance</span>
        </button>
        <button 
          onClick={() => setAppSection('message')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${appSection === 'message' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <MessageSquare className="w-6 h-6 mb-1" strokeWidth={appSection === 'message' ? 2.5 : 2} />
          <span className="text-[10px] font-semibold tracking-wide">Message</span>
        </button>
        <button 
          onClick={() => setAppSection('dropship')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${appSection === 'dropship' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Package className="w-6 h-6 mb-1" strokeWidth={appSection === 'dropship' ? 2.5 : 2} />
          <span className="text-[10px] font-semibold tracking-wide">Dropship</span>
        </button>
        <button 
          onClick={() => setAppSection('browse')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${appSection === 'browse' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Menu className="w-6 h-6 mb-1" strokeWidth={appSection === 'browse' ? 2.5 : 2} />
          <span className="text-[10px] font-semibold tracking-wide">Browse</span>
        </button>
      </div>
    </div>
  );
}
