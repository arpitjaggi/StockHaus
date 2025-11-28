import { Painting, Project } from '../types';

const ACTIVE_PROJECT_ID_KEY = 'stockhaus_active_project_id';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

type ApiOptions = RequestInit & { requireAuth?: boolean };

class DatabaseService {
  private getToken() {
    return localStorage.getItem('stockhaus_token');
  }

  private getAuthHeaders() {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  private async request<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.requireAuth !== false ? this.getAuthHeaders() : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('stockhaus_token');
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Request failed');
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json() as Promise<T>;
  }

  getActiveProjectId(): string | null {
    return localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
  }

  setActiveProjectId(id: string) {
    localStorage.setItem(ACTIVE_PROJECT_ID_KEY, id);
  }

  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async createProject(name: string, description?: string): Promise<Project> {
    const project = await this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
    this.setActiveProjectId(project.id);
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await this.request(`/projects/${id}`, { method: 'DELETE' });
    if (this.getActiveProjectId() === id) {
      localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
    }
  }

  async getActiveProject(): Promise<Project | null> {
    const id = this.getActiveProjectId();
    if (!id) return null;
    try {
      return await this.request<Project>(`/projects/${id}`);
    } catch {
      return null;
    }
  }

  async getAllPaintings(): Promise<Painting[]> {
    const projectId = this.getActiveProjectId();
    if (!projectId) throw new Error('No active project selected.');
    return this.request<Painting[]>(`/projects/${projectId}/paintings`);
  }

  async addPainting(data: {
    serialNumber: string;
    name: string;
    width: number;
    height: number;
    unit: 'cm' | 'in';
    quantity: number;
    rate?: number;
    imageBase64: string;
  }): Promise<Painting> {
    const projectId = this.getActiveProjectId();
    if (!projectId) throw new Error('No active project selected.');
    return this.request<Painting>(`/projects/${projectId}/paintings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePainting(id: string, data: Partial<Painting> & { imageBase64?: string }): Promise<Painting> {
    const projectId = this.getActiveProjectId();
    if (!projectId) throw new Error('No active project selected.');
    return this.request<Painting>(`/projects/${projectId}/paintings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePainting(id: string): Promise<boolean> {
    const projectId = this.getActiveProjectId();
    if (!projectId) throw new Error('No active project selected.');
    await this.request(`/projects/${projectId}/paintings/${id}`, { method: 'DELETE' });
    return true;
  }
}

export const db = new DatabaseService();
