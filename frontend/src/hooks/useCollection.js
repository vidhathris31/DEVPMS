import { useCallback, useEffect, useState } from "react";
import { apiErrorMessage } from "../services/api";

/**
 * Wraps a { list, create, update, remove } service into stateful
 * data + loading + error + mutation helpers, so pages don't each
 * reimplement the same fetch/create/delete boilerplate.
 */
export function useCollection(service, projectId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.list(projectId);
      setData(result);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [service, projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload) => {
      const created = await service.create(payload);
      setData((d) => [created, ...d]);
      return created;
    },
    [service]
  );

  const update = useCallback(
    async (id, payload) => {
      const updated = await service.update(id, payload);
      setData((d) => d.map((item) => (item._id === id ? updated : item)));
      return updated;
    },
    [service]
  );

  const remove = useCallback(
    async (id) => {
      await service.remove(id);
      setData((d) => d.filter((item) => item._id !== id));
    },
    [service]
  );

  // For mutations that go through a dedicated endpoint rather than
  // service.update (e.g. patching a single task subdocument on a project),
  // this merges the already-saved parent item back into local state.
  const replaceOne = useCallback((item) => {
    setData((d) => d.map((x) => (x._id === item._id ? item : x)));
  }, []);

  return { data, loading, error, refresh, create, update, remove, replaceOne };
}
