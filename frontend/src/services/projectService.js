import { api } from "./api";

export const projectService = {
  list: () => api.get("/projects").then((r) => r.data),
  get: (id) => api.get(`/projects/${id}`).then((r) => r.data),
  create: (payload) => api.post("/projects", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/projects/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/projects/${id}`),
  addTask: (projectId, task) => api.post(`/projects/${projectId}/tasks`, task).then((r) => r.data),
  updateTask: (projectId, taskId, patch) => api.patch(`/projects/${projectId}/tasks/${taskId}`, patch).then((r) => r.data),
  deleteTask: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`).then((r) => r.data),
};
