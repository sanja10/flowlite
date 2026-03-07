"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBoard, getTemplates } from "@/lib/queries";
import { useState } from "react";

export default function NewBoardPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { token } = useAuth();

  const templatesQ = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });

  const [name, setName] = useState("");
  const [templateKey, setTemplateKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const createM = useMutation({
    mutationFn: () => {
      if (!token) throw new Error("No token available");
      return createBoard(token, { name, templateKey });
    },
    onSuccess: async (board) => {
      await qc.invalidateQueries({ queryKey: ["boards"] });
      router.push(`/boards/${board.id}`);
    },
    onError: (e: Error) => setError(e.message ?? "Failed to create board"),
  });

  if (!token) {
    router.push("/login");
    return null;
  }

  const templates = templatesQ.data ?? [];

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <button
        className="text-sm underline"
        onClick={() => router.push("/boards")}
      >
        Back
      </button>

      <h1 className="text-2xl font-semibold mt-4">Create board</h1>

      <div className="mt-6 space-y-4">
        <div className="space-y-1">
          <label className="text-sm">Board name</label>
          <input
            className="w-full border rounded-md p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Template</label>
          {templatesQ.isLoading && <p>Loading templates…</p>}
          {templatesQ.error && (
            <p className="text-red-600">
              {(templatesQ.error as Error)?.message}
            </p>
          )}

          {templates.length > 0 && (
            <select
              className="w-full border rounded-md p-2"
              value={templateKey}
              onChange={(e) => setTemplateKey(e.target.value)}
            >
              <option value="" disabled>
                Select a template…
              </option>
              {templates.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {templateKey && (
          <div className="border rounded-xl p-4">
            <p className="font-medium">Preview</p>
            <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">
              {templates
                .find((t) => t.key === templateKey)
                ?.statuses.sort((a, b) => a.order - b.order)
                .map((s) => (
                  <li key={s.order}>
                    {s.name}
                    {s.isDone ? " (Done)" : ""}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          className="bg-black text-white rounded-md px-4 py-2 disabled:opacity-50"
          disabled={!name.trim() || !templateKey || createM.isPending}
          onClick={() => createM.mutate()}
        >
          {createM.isPending ? "Creating…" : "Create"}
        </button>
      </div>
    </main>
  );
}
