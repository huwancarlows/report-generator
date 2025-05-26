import React, { useState } from 'react';

interface GenderDistributionModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: { male: string; female: string }) => void;
    initialData?: { male: string; female: string };
}

export default function GenderDistributionModal({ open, onClose, onSave, initialData }: GenderDistributionModalProps) {
    const [male, setMale] = useState(initialData?.male || '');
    const [female, setFemale] = useState(initialData?.female || '');

    const handleSave = () => {
        onSave({ male, female });
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">13. Gender Distribution</h2>
                <div className="flex flex-col gap-4">
                    <label>
                        Male
                        <input type="number" value={male} onChange={e => setMale(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
                    </label>
                    <label>
                        Female
                        <input type="number" value={female} onChange={e => setFemale(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
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