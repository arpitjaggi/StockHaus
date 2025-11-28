import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Clock, ChevronRight, Trash2, Package, Circle } from 'lucide-react';
import { db } from '../lib/db';
import { Project } from '../types';

export const ProjectSelection: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const data = await db.getProjects();
    setProjects(data);
    setIsLoading(false);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsLoading(true);
    await db.createProject(newProjectName);
    // Determine where to go based on device
    const isMobile = window.innerWidth < 768;
    navigate(isMobile ? '/upload' : '/dashboard');
  };

  const handleSelectProject = (id: string) => {
    db.setActiveProjectId(id);
    const isMobile = window.innerWidth < 768;
    navigate(isMobile ? '/upload' : '/dashboard');
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure? This will delete the project and all inventory data inside it.")) {
      await db.deleteProject(id);
      loadProjects();
    }
  };

  // Consistent input styling
  const inputClass = "w-full h-12 px-4 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-300 text-slate-900";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      
      {/* Brand Header */}
      <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center bg-white p-4 rounded-full shadow-sm mb-4">
           <Circle size={40} className="text-brand-500 fill-brand-500" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-1 tracking-tight">StockHaus</h1>
        <p className="text-slate-500 font-light tracking-wide text-sm uppercase">by The Art Warehouse</p>
      </div>

      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-lg font-semibold text-slate-700">Your Projects</h2>
          <button 
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
          >
            <Plus size={18} /> New Project
          </button>
        </div>

        {/* Project List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading sessions...</div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <FolderOpen size={32} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No projects yet</h3>
              <p className="text-slate-500 mb-6 max-w-xs mx-auto">Create a new session to start cataloging your painting inventory.</p>
              <button 
                onClick={() => setShowNewProjectModal(true)}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-200"
              >
                <Plus size={20} /> Create First Project
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  onClick={() => handleSelectProject(project.id)}
                  className="group bg-white p-5 rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-brand-200 cursor-pointer transition-all duration-200 flex items-center justify-between relative overflow-hidden"
                >
                  <div className="flex items-start gap-4 z-10">
                    <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <FolderOpen size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-brand-600 transition-colors">{project.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> 
                          {new Date(project.lastAccessed).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package size={14} />
                          {project.itemCount} items
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 z-10">
                    <button 
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="p-2 text-slate-300 group-hover:text-brand-500 transition-colors group-hover:translate-x-1 duration-300">
                      <ChevronRight size={24} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Session</h3>
            <form onSubmit={handleCreateProject}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="e.g. Summer Collection 2024"
                  className={inputClass}
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-200 transition-colors"
                >
                  {isLoading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-slate-400 text-xs">
        &copy; {new Date().getFullYear()} The Art Warehouse. All rights reserved.
      </div>
    </div>
  );
};