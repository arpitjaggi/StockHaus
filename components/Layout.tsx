import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Circle, Menu, X, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react';
import { db } from '../lib/db';
import { Project } from '../types';
import { useAuth } from '../providers/AuthProvider';

export const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isSwitchingProject, setIsSwitchingProject] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      const [active, list] = await Promise.all([db.getActiveProject(), db.getProjects()]);
      setCurrentProject(active);
      setProjects(list);
    };
    loadData();
  }, [location.pathname, isSwitchModalOpen]); // keep data fresh when navigating/closing modal

  const handleOpenSwitchProject = () => {
    setIsSwitchModalOpen(true);
  };

  const navItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/app/upload', label: 'Add Item', icon: <PlusCircle size={20} /> },
  ];

  const selectProject = async (id: string) => {
    try {
      setIsSwitchingProject(true);
      db.setActiveProjectId(id);
      const [active, list] = await Promise.all([db.getActiveProject(), db.getProjects()]);
      setCurrentProject(active);
      setProjects(list);
      setIsSwitchModalOpen(false);
      const isMobile = window.innerWidth < 768;
      navigate(isMobile ? '/app/upload' : '/app/dashboard');
    } finally {
      setIsSwitchingProject(false);
    }
  };

  const ProjectSwitchModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSwitchModalOpen(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Switch Session</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">Select a project</h3>
          </div>
          <button
            onClick={() => setIsSwitchModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close project switcher"
          >
            <X size={24} />
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 px-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <p className="text-slate-500 mb-4">No sessions available yet.</p>
            <button
              onClick={() => {
                setIsSwitchModalOpen(false);
                navigate('/');
              }}
              className="px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
            >
              Create a project
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {projects.map((project) => {
              const isActive = currentProject?.id === project.id;
              return (
                <button
                  key={project.id}
                  onClick={() => selectProject(project.id)}
                  disabled={isSwitchingProject}
                  className={`w-full flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all ${
                    isActive
                      ? 'border-brand-200 bg-brand-50 shadow-sm'
                      : 'border-slate-200 hover:border-brand-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className={`font-semibold ${isActive ? 'text-brand-700' : 'text-slate-900'}`}>{project.name}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(project.lastAccessed).toLocaleDateString()} • {project.itemCount} items
                    </p>
                  </div>
                  {isActive ? (
                    <CheckCircle2 className="text-brand-600" size={24} />
                  ) : (
                    <ChevronRight className="text-slate-300" size={24} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

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
          <div className="flex flex-col gap-3">
            <div className="text-xs text-slate-400 uppercase font-semibold">Signed in as</div>
            <div className="text-sm text-slate-700 break-all">{user?.username}</div>
            <div className="flex gap-2">
              <button 
                onClick={handleOpenSwitchProject}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut size={16} />
                Switch Project
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors text-sm font-medium"
              >
                Log out
              </button>
            </div>
          </div>
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
                <button onClick={handleOpenSwitchProject} className="text-xs text-brand-600 font-medium">Switch</button>
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
              
              <div className="space-y-3">
                <button
                  onClick={handleOpenSwitchProject}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg text-slate-500 hover:text-slate-800"
                >
                  <LogOut size={20} />
                  Switch Project
                </button>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full px-4 py-4 rounded-xl text-lg text-red-500 border border-red-100 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-white p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      {isSwitchModalOpen && <ProjectSwitchModal />}
    </div>
  );
};