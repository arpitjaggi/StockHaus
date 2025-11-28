import { Painting, Project } from '../types';

// ==========================================
// DATABASE ABSTRACTION LAYER
// ==========================================

const PROJECTS_KEY = 'stockhaus_projects';
const ACTIVE_PROJECT_ID_KEY = 'stockhaus_active_project_id';
const DATA_PREFIX = 'stockhaus_data_';

// Simulate network delay for realistic UI feedback
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class DatabaseService {
  
  // --- SESSION / PROJECT MANAGEMENT ---

  /**
   * Get all available projects
   */
  async getProjects(): Promise<Project[]> {
    await delay(200);
    try {
      const data = localStorage.getItem(PROJECTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Create a new project and set it as active
   */
  async createProject(name: string, description?: string): Promise<Project> {
    await delay(300);
    const projects = await this.getProjects();
    
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      itemCount: 0
    };

    projects.unshift(newProject); // Add to top
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    
    // Set as active
    this.setActiveProjectId(newProject.id);
    
    return newProject;
  }

  /**
   * Delete a project and its data
   */
  async deleteProject(id: string): Promise<void> {
    await delay(300);
    const projects = await this.getProjects();
    const updatedProjects = projects.filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    
    // Delete actual data
    localStorage.removeItem(`${DATA_PREFIX}${id}`);
    
    // If deleted project was active, clear active state
    if (this.getActiveProjectId() === id) {
      localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
    }
  }

  /**
   * Set the active project ID for the session
   */
  setActiveProjectId(id: string) {
    localStorage.setItem(ACTIVE_PROJECT_ID_KEY, id);
    this.updateProjectAccessTime(id);
  }

  /**
   * Get currently active project ID
   */
  getActiveProjectId(): string | null {
    return localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
  }

  /**
   * Get full details of currently active project
   */
  async getActiveProject(): Promise<Project | null> {
    const id = this.getActiveProjectId();
    if (!id) return null;
    const projects = await this.getProjects();
    return projects.find(p => p.id === id) || null;
  }

  private async updateProjectAccessTime(id: string) {
    const projects = await this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index].lastAccessed = Date.now();
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    }
  }

  private async updateProjectItemCount(id: string, count: number) {
    const projects = await this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index].itemCount = count;
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    }
  }

  // --- DATA MANAGEMENT (Scoped to Active Project) ---

  private getStorageKey(): string {
    const projectId = this.getActiveProjectId();
    if (!projectId) throw new Error("No active project session.");
    return `${DATA_PREFIX}${projectId}`;
  }

  /**
   * Fetch all paintings for the ACTIVE project
   */
  async getAllPaintings(): Promise<Painting[]> {
    await delay(300);
    try {
      const key = this.getStorageKey();
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("DB Error:", error);
      return [];
    }
  }

  /**
   * Add a new painting entry to ACTIVE project
   */
  async addPainting(data: Omit<Painting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Painting> {
    await delay(500);
    const projectId = this.getActiveProjectId();
    if (!projectId) throw new Error("No active project");

    const paintings = await this.getAllPaintings();
    
    const newPainting: Painting = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    paintings.push(newPainting);
    this._save(paintings);
    
    // Update metadata count
    this.updateProjectItemCount(projectId, paintings.length);
    
    return newPainting;
  }

  /**
   * Update an existing painting
   */
  async updatePainting(id: string, data: Partial<Painting>): Promise<Painting | null> {
    await delay(400);
    const paintings = await this.getAllPaintings();
    const index = paintings.findIndex(p => p.id === id);
    
    if (index === -1) return null;

    const updated: Painting = {
      ...paintings[index],
      ...data,
      updatedAt: Date.now()
    };

    paintings[index] = updated;
    this._save(paintings);
    return updated;
  }

  /**
   * Delete a painting
   */
  async deletePainting(id: string): Promise<boolean> {
    await delay(300);
    const projectId = this.getActiveProjectId();
    if (!projectId) throw new Error("No active project");

    const paintings = await this.getAllPaintings();
    const filtered = paintings.filter(p => p.id !== id);
    
    if (paintings.length === filtered.length) return false;
    
    this._save(filtered);
    this.updateProjectItemCount(projectId, filtered.length);
    
    return true;
  }

  // Internal helper
  private _save(data: Painting[]) {
    try {
      const key = this.getStorageKey();
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Storage Quota Exceeded.", e);
      alert("Storage full! Try deleting some items or using smaller images.");
    }
  }
}

export const db = new DatabaseService();