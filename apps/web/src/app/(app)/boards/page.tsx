"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getBoards } from "@/lib/queries";

export default function BoardsPage() {
  const router = useRouter();
  const { token, logout } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["boards"],
    queryFn: () => getBoards(token!),
    enabled: !!token,
  });

  // Simple guard (MVP)
  if (!token) {
    router.push("/login");
    return null;
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Boards</h1>
        <div className="flex gap-2">
          <button
            className="border rounded-md px-3 py-2"
            onClick={() => router.push("/boards/new")}
          >
            New board
          </button>
          <button className="border rounded-md px-3 py-2" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      {isLoading && <p className="mt-6">Loading…</p>}
      {error && (
        <p className="mt-6 text-red-600">
          {typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : String(error)}
        </p>
      )}

      {data && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((b) => (
            <button
              key={b.id}
              onClick={() => router.push(`/boards/${b.id}`)}
              className="text-left border rounded-xl p-4 hover:bg-gray-50"
            >
              <div className="font-medium">{b.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                Template: {b.templateKey}
              </div>
              <div className="text-sm text-gray-600">Stuck: {b.stuckDays}d</div>
            </button>
          ))}
        </div>
      )}

      {data && data.length === 0 && (
        <div className="mt-8 border rounded-xl p-6">
          <p className="font-medium">No boards yet.</p>
          <p className="text-sm text-gray-600 mt-1">
            Create your first board from a template.
          </p>
          <button
            className="mt-4 border rounded-md px-3 py-2"
            onClick={() => router.push("/boards/new")}
          >
            Create board
          </button>
        </div>
      )}
    </main>
  );
}
