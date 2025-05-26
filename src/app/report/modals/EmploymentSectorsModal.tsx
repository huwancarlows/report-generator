import React, { useState } from 'react';

interface EmploymentSectorsModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: { government: string; private: string; overseas: string }) => void;
    initialData?: { government: string; private: string; overseas: string };
}

export default function EmploymentSectorsModal({ open, onClose, onSave, initialData }: EmploymentSectorsModalProps) {
    const [government, setGovernment] = useState(initialData?.government || '');
    const [privateSector, setPrivateSector] = useState(initialData?.private || '');
    const [overseas, setOverseas] = useState(initialData?.overseas || '');

    const handleSave = () => {
        onSave({ government, private: privateSector, overseas });
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">14. Employment Sectors</h2>
                <div className="flex flex-col gap-4">
                    <label>
                        Government
                        <input type="number" value={government} onChange={e => setGovernment(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
                    </label>
                    <label>
                        Private
                        <input type="number" value={privateSector} onChange={e => setPrivateSector(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
                    </label>
                    <label>
                        Overseas
                        <input type="number" value={overseas} onChange={e => setOverseas(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
                    </label>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg" onClick={onClose}>Cancel</button>
                    <button type="button" className="px-5 py-2 bg-blue-600 text-white rounded-lg" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
} 