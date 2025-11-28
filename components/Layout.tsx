import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Circle, Menu, X, LogOut, ChevronRight } from 'lucide-react';
import { db } from '../lib/db';
import { Project } from '../types';

export const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadProject = async () => {
      const p = await db.getActiveProject();
      setCurrentProject(p);
    };
    loadProject();
  }, [location.pathname]); // Reload when path changes just to be safe

  const handleSwitchProject = () => {
    // We don't necessarily need to clear the session ID here if we want 
    // to remember the last one, but for UI clarity:
    // db.setActiveProjectId(''); 
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/upload', label: 'Add Item', icon: <PlusCircle size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          {/* Logo Representation - Orange Dot */}
          <div className="text-brand-500 shrink-0">
            <Circle size={28} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-slate-900 leading-none">StockHaus</span>
            <span className="font-light text-xs text-slate-500 mt-1">by The Art Warehouse</span>
          </div>
        </div>
        
        {/* Active Project Info */}
        <div className="px-4 py-4">
           <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Current Session</p>
              <p className="text-sm font-bold text-slate-800 truncate">{currentProject?.name || 'Loading...'}</p>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-50 text-brand-700 font-medium' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-100">
           <button 
            onClick={handleSwitchProject}
            className="flex items-center gap-2 w-full px-4 py-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors text-sm font-medium"
           >
             <LogOut size={18} />
             Switch Project
           </button>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 z-20">
          <div className="flex items-center gap-2">
            <div className="text-brand-500 shrink-0">
              <Circle size={24} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900 leading-none">StockHaus</span>
              <span className="font-light text-[10px] text-slate-500">by The Art Warehouse</span>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-50 rounded-full"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-10 bg-white/95 backdrop-blur-sm pt-20 px-6">
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Active Project</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{currentProject?.name}</p>
                <button onClick={handleSwitchProject} className="text-xs text-brand-600 font-medium">Switch</button>
              </div>
            </div>

            <nav className="space-y-4">
               {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-4 rounded-xl text-lg transition-all ${
                      isActive 
                        ? 'bg-brand-50 text-brand-700 font-medium' 
                        : 'text-slate-600 border border-transparent'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
              
              <button
                onClick={handleSwitchProject}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg text-slate-500 hover:text-slate-800"
              >
                <LogOut size={20} />
                Switch Project
              </button>
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-white p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};