import { api, apiErrorMessage } from "./api";

/**
 * Calls the backend's groq-backed chat endpoint.
 * Used by every AI-powered page (AI Analyst, Code Review, Burndown, Sprint
 * Planner, Tech Debt, Reports) instead of each page hitting a raw fetch.
 *
 * @param {Object} params
 * @param {"ai-analyst"|"code-review"|"burndown"|"sprint-planner"|"tech-debt"|"reports"} params.feature
 * @param {string} [params.system]
 * @param {{role: "user"|"assistant", content: string}[]} params.messages
 * @param {string} [params.project] - project id, for history scoping
 * @param {number} [params.maxTokens]
 * @returns {Promise<string>} assistant response text
 */
export async function askAI({ feature, system, messages, project, maxTokens }) {
  try {
    const { data } = await api.post("/ai/chat", { feature, system, messages, project, maxTokens });
    return data.text;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function getAIHistory(feature, project) {
  const { data } = await api.get(`/ai/history/${feature}`, { params: project ? { project } : {} });
  return data;
}
