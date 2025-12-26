import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { oauthClientApi } from "../../app/api/oauthClientApi";
import { toast } from "sonner";

export default function ClientList() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const response = await oauthClientApi.list(tenantId);
      setClients(response.clients);
    } catch (error: any) {
      toast.error("Failed to load clients: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [tenantId]);

  const handleDelete = async (clientId: string) => {
    if (!tenantId || !confirm("Are you sure you want to delete this client?")) return;

    try {
      await oauthClientApi.delete(tenantId, clientId);
      toast.success("Client deleted successfully");
      fetchClients();
    } catch (error: any) {
      toast.error("Failed to delete client: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OAuth Clients</h1>
          <p className="text-gray-500 mt-1">Manage applications that can authenticate with your tenant.</p>
        </div>
        <Link
          to={`/tenant/${tenantId}/clients/new`}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Register Client
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {clients.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <p className="text-gray-500">No OAuth clients found. Register your first application to get started.</p>
            </li>
          ) : (
            clients.map((client) => (
              <li key={client.id} className="hover:bg-gray-50">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">{client.client_name}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.token_endpoint_auth_method === 'none'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                          }`}>
                          {client.token_endpoint_auth_method === 'none' ? 'Public' : 'Confidential'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="truncate">Client ID: <code className="bg-gray-100 px-1 rounded">{client.client_id}</code></span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex-shrink-0 flex space-x-3">
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
