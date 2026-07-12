import { api } from "./api";

export const settingsService = {
  get: () => api.get("/settings").then((r) => r.data),
  update: (payload) => api.put("/settings", payload).then((r) => r.data),
  setMood: (employeeId, mood, note) => api.post("/settings/mood", { employeeId, mood, note }).then((r) => r.data),
};
