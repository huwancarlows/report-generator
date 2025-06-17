import React, { useState } from 'react';

interface EmploymentSectorsModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: { government: string; private: string }) => void;
    initialData?: { government: string; private: string };
}

export default function EmploymentSectorsModal({ open, onClose, onSave, initialData }: EmploymentSectorsModalProps) {
    const [government, setGovernment] = useState(initialData?.government || '');
    const [privateSector, setPrivateSector] = useState(initialData?.private || '');

    const handleSave = () => {
        onSave({ government, private: privateSector });
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 sm:p-0 relative animate-fadeIn">
                <button
                    type="button"
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors text-2xl focus:outline-none z-10"
                    aria-label="Close modal"
                    onClick={onClose}
                >
                    ×
                </button>
                <div className="flex flex-col h-full">
                    <div className="px-8 pt-8 pb-2 shrink-0">
                        <h2 className="text-2xl font-bold mb-2 text-center text-blue-800 tracking-tight">14. Employment Sectors</h2>
                        <p className="text-center text-gray-500 mb-4">Enter the employment sector distribution for this period.</p>
                    </div>
                    <div className="px-8 pb-2 grow">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="government-input">Government</label>
                                <input
                                    id="government-input"
                                    type="number"
                                    min={0}
                                    value={government}
                                    onChange={e => setGovernment(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-colors text-sm"
                                    placeholder="Enter number in government sector"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="private-input">Private</label>
                                <input
                                    id="private-input"
                                    type="number"
                                    min={0}
                                    value={privateSector}
                                    onChange={e => setPrivateSector(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-colors text-sm"
                                    placeholder="Enter number in private sector"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="px-8 pt-2 pb-6 shrink-0 bg-white">
                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-5 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 transition-colors font-semibold"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 