import { ShieldCheck } from "lucide-react";

export default function AdminList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <ShieldCheck className="h-8 w-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Platform Administrators</h1>
      </div>

      <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Platform Identity Management</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Platform-level administrators are currently managed via the secure shell bootstrap process.
          Self-service management of platform admins will be available in future releases.
        </p>
        <div className="mt-6 flex justify-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            Bootstrap Role Active
          </span>
        </div>
      </div>
    </div>
  );
}
