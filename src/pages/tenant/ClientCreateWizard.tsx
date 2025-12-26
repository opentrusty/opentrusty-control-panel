import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { oauthClientApi } from "../../app/api/oauthClientApi";
import { toast } from "sonner";

type WizardStep = 'basics' | 'security' | 'confirmation';

export default function ClientCreateWizard() {
    const { tenantId } = useParams<{ tenantId: string }>();
    const navigate = useNavigate();
    const [step, setStep] = useState<WizardStep>('basics');
    const [loading, setLoading] = useState(false);
    const [createdClient, setCreatedClient] = useState<any>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        client_name: "",
        client_type: "web_application" as 'web_application' | 'spa',
        redirect_uris: [""] as string[],
        allowed_scopes: ["openid", "profile"] as string[],
    });

    const handleCreate = async () => {
        if (!tenantId) return;
        try {
            setLoading(true);
            const response = await oauthClientApi.create(tenantId, {
                client_name: formData.client_name,
                redirect_uris: formData.redirect_uris,
                allowed_scopes: formData.allowed_scopes,
                grant_types: formData.client_type === 'spa' ? ['authorization_code'] : ['authorization_code', 'refresh_token'],
                response_types: ['code'],
                token_endpoint_auth_method: formData.client_type === 'spa' ? 'none' : 'client_secret_basic',
            });

            setCreatedClient(response.client);
            setClientSecret(response.client_secret);
            setStep('confirmation');
            toast.success("Client registered successfully");
        } catch (error: any) {
            toast.error("Registration failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    if (step === 'confirmation') {
        return (
            <div className="max-w-xl mx-auto py-8">
                <div className="bg-white shadow sm:rounded-lg border border-green-200">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Registration Successful!</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>Your OAuth 2.0 client has been created. Save these credentials now.</p>
                        </div>

                        <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 font-bold">Important: Save your Client Secret</p>
                                    <p className="text-sm text-red-700 mt-1">
                                        For security reasons, we will never show the secret again. If you lose it, you will have to regenerate it.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Client ID</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        readOnly
                                        value={createdClient?.client_id}
                                        className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(createdClient?.client_id)}
                                        className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            {clientSecret && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Client Secret</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            readOnly
                                            value={clientSecret}
                                            className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-red-300 bg-red-50 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(clientSecret)}
                                            className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-red-300 bg-red-50 text-red-500 text-sm hover:bg-red-100"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={() => navigate(`/tenant/${tenantId}/clients`)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Register Client</h1>

            <div className="bg-white shadow sm:rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-5 sm:p-6 space-y-8">
                    {step === 'basics' ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Application Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Acme Marketing Website"
                                    value={formData.client_name}
                                    onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Application Type</label>
                                <div className="grid grid-cols-1 gap-4">
                                    <div
                                        onClick={() => setFormData({ ...formData, client_type: 'web_application' })}
                                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${formData.client_type === 'web_application' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                            }`}
                                    >
                                        <div className="font-bold">Web Application</div>
                                        <div className="text-xs text-gray-500">For server-side applications. Uses a Client Secret.</div>
                                    </div>
                                    <div
                                        onClick={() => setFormData({ ...formData, client_type: 'spa' })}
                                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${formData.client_type === 'spa' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                            }`}
                                    >
                                        <div className="font-bold">SPA / Mobile App</div>
                                        <div className="text-xs text-gray-500">For apps with no backend. No Client Secret.</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <button
                                    onClick={() => setStep('security')}
                                    disabled={!formData.client_name}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Redirect URIs</label>
                                {formData.redirect_uris.map((uri, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="https://app.com/callback"
                                            value={uri}
                                            onChange={e => {
                                                const uris = [...formData.redirect_uris];
                                                uris[index] = e.target.value;
                                                setFormData({ ...formData, redirect_uris: uris });
                                            }}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                        {formData.redirect_uris.length > 1 && (
                                            <button
                                                onClick={() => {
                                                    const uris = formData.redirect_uris.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, redirect_uris: uris });
                                                }}
                                                className="text-red-600 px-2"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={() => setFormData({ ...formData, redirect_uris: [...formData.redirect_uris, ""] })}
                                    className="text-blue-600 text-sm font-medium"
                                >
                                    + Add URI
                                </button>
                            </div>

                            <div className="flex justify-between pt-4 border-t">
                                <button
                                    onClick={() => setStep('basics')}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={loading || formData.redirect_uris.some(u => !u)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                                >
                                    {loading ? "Registering..." : "Complete Registration"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
