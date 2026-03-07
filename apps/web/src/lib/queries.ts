import { apiFetch } from "@/lib/api";

export type Board = {
  id: string;
  name: string;
  templateKey: string;
  stuckDays: number;
  createdAt: string;
};
export type Template = {
  key: string;
  name: string;
  defaultStuckDays: number;
  statuses: { name: string; order: number; isDone: boolean }[];
};

export function getTemplates() {
  return apiFetch<Template[]>("/templates");
}

export function getBoards(token: string) {
  return apiFetch<Board[]>("/boards", { token });
}

export function createBoard(
  token: string,
  body: { name: string; templateKey: string },
) {
  return apiFetch<Board>("/boards", { method: "POST", token, body });
}
