import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useCollection } from "../hooks/useCollection";
import { projectService } from "../services/projectService";
import { employeeService } from "../services/employeeService";
import { notificationService } from "../services/notificationService";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const projectsState = useCollection(projectService);
  const employeesState = useCollection(employeeService);
  const [feed, setFeed] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const pushFeed = useCallback((entry) => {
    setFeed((f) => [{ id: Date.now(), time: "just now", ...entry }, ...f].slice(0, 30));
  }, []);

  const refreshNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const result = await notificationService.list();
      setNotifications(result);
    } catch {
      // Notifications are a nice-to-have, not critical path — fail quietly.
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const markNotificationRead = useCallback(async (id) => {
    setNotifications((ns) => ns.map((n) => (n._id === id ? { ...n, read: true } : n)));
    try {
      await notificationService.markRead(id);
    } catch {
      // Optimistic update already applied; a background refresh will reconcile if needed.
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    try {
      await notificationService.markAllRead();
    } catch {
      // Optimistic update already applied.
    }
  }, []);

  const saveProject = useCallback(
    async (payload) => {
      if (payload._id) {
        const updated = await projectsState.update(payload._id, payload);
        pushFeed({ type: "project", text: `${updated.name} updated`, icon: "✏️", color: "#FCD34D" });
        return updated;
      }
      const created = await projectsState.create(payload);
      pushFeed({ type: "project", text: `New project: ${created.name}`, icon: "⬡", color: "#34D4F0" });
      return created;
    },
    [projectsState, pushFeed]
  );

  const deleteProject = useCallback(
    async (id) => {
      await projectsState.remove(id);
    },
    [projectsState]
  );

  const updateProjectTasks = useCallback(
    async (projectId, updatedProject) => {
      // Only send the fields that can actually change here — the full project
      // object (as read from the API) also carries _id/owner/timestamps/__v,
      // which the update endpoint doesn't need and shouldn't be asked to set.
      // eslint-disable-next-line no-unused-vars
      const { _id, owner, createdAt, updatedAt, __v, ...safeProject } = updatedProject;
      const saved = await projectsState.update(projectId, safeProject);
      pushFeed({ type: "task", text: `Task updated in ${saved.name}`, icon: "◎", color: "#4ADE80" });
      return saved;
    },
    [projectsState, pushFeed]
  );

  const editTask = useCallback(
    async (projectId, taskId, patch) => {
      const saved = await projectService.updateTask(projectId, taskId, patch);
      projectsState.replaceOne(saved);
      pushFeed({ type: "task", text: `Task updated in ${saved.name}`, icon: "✏️", color: "#FCD34D" });
      return saved;
    },
    [projectsState, pushFeed]
  );

  const saveEmployee = useCallback(
    async (payload) => {
      if (payload._id) {
        const updated = await employeesState.update(payload._id, payload);
        pushFeed({ type: "employee", text: `${updated.name} updated`, icon: "✏️", color: "#FCD34D" });
        return updated;
      }
      const created = await employeesState.create(payload);
      pushFeed({ type: "employee", text: `New engineer: ${created.name}`, icon: "◉", color: "#C4B5FD" });
      return created;
    },
    [employeesState, pushFeed]
  );

  const deleteEmployee = useCallback(
    async (id) => {
      await employeesState.remove(id);
    },
    [employeesState]
  );

  const value = useMemo(
    () => ({
      projects: projectsState.data,
      projectsLoading: projectsState.loading,
      projectsError: projectsState.error,
      refreshProjects: projectsState.refresh,
      employees: employeesState.data,
      employeesLoading: employeesState.loading,
      employeesError: employeesState.error,
      refreshEmployees: employeesState.refresh,
      feed,
      saveProject,
      deleteProject,
      updateProjectTasks,
      editTask,
      saveEmployee,
      deleteEmployee,
      notifications,
      notificationsLoading,
      unreadNotificationCount: notifications.filter((n) => !n.read).length,
      refreshNotifications,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      projectsState,
      employeesState,
      feed,
      saveProject,
      deleteProject,
      updateProjectTasks,
      editTask,
      saveEmployee,
      deleteEmployee,
      notifications,
      notificationsLoading,
      refreshNotifications,
      markNotificationRead,
      markAllNotificationsRead,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}
