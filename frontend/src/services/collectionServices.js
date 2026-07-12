import { api } from "./api";

/**
 * Builds a { list, create, update, remove } service for a simple REST
 * collection that supports an optional ?project= filter. Used for the
 * time-entries, comments, files, and expenses resources, which all share
 * the same shape and previously would have needed near-identical files.
 */
export function createCollectionService(resourcePath) {
  return {
    list: (projectId) => api.get(`/${resourcePath}`, { params: projectId ? { project: projectId } : {} }).then((r) => r.data),
    create: (payload) => api.post(`/${resourcePath}`, payload).then((r) => r.data),
    update: (id, payload) => api.put(`/${resourcePath}/${id}`, payload).then((r) => r.data),
    remove: (id) => api.delete(`/${resourcePath}/${id}`),
  };
}

export const timeEntryService = createCollectionService("time-entries");
export const commentService = createCollectionService("comments");
export const fileService = {
  ...createCollectionService("files"),
  upload: (file, project, projectName) => {
    const formData = new FormData();
    formData.append("file", file);
    if (project) formData.append("project", project);
    if (projectName) formData.append("projectName", projectName);
    return api.post("/files/upload", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
  },
};
export const expenseService = createCollectionService("expenses");
