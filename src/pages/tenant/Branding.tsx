import { Palette } from "lucide-react";

export default function Branding() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
                <Palette className="h-8 w-8 text-pink-600" />
                <h1 className="text-2xl font-bold text-gray-900">Tenant Branding</h1>
            </div>

            <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Custom Branding</h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    Custom logos, colors, and email templates will be available in a future release.
                    This will allow you to provide a seamless authentication experience for your users.
                </p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50 grayscale">
                    <div className="h-24 bg-gray-100 rounded flex items-center justify-center border border-gray-200">Logo Upload</div>
                    <div className="h-24 bg-gray-100 rounded flex items-center justify-center border border-gray-200">Theme Colors</div>
                    <div className="h-24 bg-gray-100 rounded flex items-center justify-center border border-gray-200">Email Templates</div>
                </div>
                <div className="mt-8 flex justify-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        Feature coming soon
                    </span>
                </div>
            </div>
        </div>
    );
}
