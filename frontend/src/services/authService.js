import { api } from "./api";

export async function registerRequest({ name, email, password, role }) {
  const { data } = await api.post("/auth/register", { name, email, password, role });
  return data;
}

export async function loginRequest({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function meRequest() {
  const { data } = await api.get("/auth/me");
  return data;
}
