"use client";
import { useNotification } from "@/hooks/useNotification";

export function DisplayNotification({ id }: { id: string | undefined }) {
  const { notification, loading } = useNotification(id ?? undefined);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!notification) {
    return <div className="p-4">Notification not found.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-semibold">Notification</h1>

      <div className="space-y-3 rounded-xl bg-white p-4 shadow">
        <div>
          <p className="text-sm text-gray-500">Type</p>
          <p className="font-medium">{notification.type}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Message</p>
          <p className="whitespace-pre-wrap">{notification.message}</p>
        </div>

        {notification.metadata && (
          <div>
            <p className="text-sm text-gray-500">Metadata</p>
            <pre className="rounded bg-gray-100 p-2 text-sm">
              {JSON.stringify(notification.metadata, null, 2)}
            </pre>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">Created At</p>
          <p>{new Date(notification.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
