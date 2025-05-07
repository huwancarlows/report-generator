import React, { useEffect, useRef, useState } from 'react';

interface TopJob {
    position: string;
    vacancies: string;
    qualified: string;
}

interface Education {
    elementary: string;
    secondary: string;
    college: string;
    graduate: string;
}

interface Sectors {
    government: string;
    private: string;
    overseas: string;
}

export interface QuickAddData {
    topJobs: TopJob[];
    education: Education;
    sectors: Sectors;
}

interface QuickAddModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: QuickAddData) => void;
    initialData?: QuickAddData;
}

const defaultEducation: Education = {
    elementary: '',
    secondary: '',
    college: '',
    graduate: '',
};
const defaultSectors: Sectors = {
    government: '',
    private: '',
    overseas: '',
};

export default function QuickAddModal({ open, onClose, onSave, initialData }: QuickAddModalProps) {
    const [topJobs, setTopJobs] = useState<TopJob[]>(initialData?.topJobs || [{ position: '', vacancies: '', qualified: '' }]);
    const [education, setEducation] = useState<Education>(initialData?.education || defaultEducation);
    const [sectors, setSectors] = useState<Sectors>(initialData?.sectors || defaultSectors);
    const modalRef = useRef<HTMLDivElement>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);

    // Focus trap and ESC to close
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            // Trap focus
            if (e.key === 'Tab' && modalRef.current) {
                const focusable = modalRef.current.querySelectorAll<HTMLElement>(
                    'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                } else if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        // Focus first input
        setTimeout(() => firstInputRef.current?.focus(), 100);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    const updateTopJob = (idx: number, field: keyof TopJob, value: string) => {
        setTopJobs(jobs => jobs.map((job, i) => i === idx ? { ...job, [field]: value } : job));
    };
    const addTopJob = () => {
        if (topJobs.length < 10) setTopJobs([...topJobs, { position: '', vacancies: '', qualified: '' }]);
    };
    const removeTopJob = (idx: number) => {
        setTopJobs(jobs => jobs.filter((_, i) => i !== idx));
    };
    const handleSave = () => {
        onSave({ topJobs, education, sectors });
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 transition-opacity duration-200 animate-fade-in">
            <div
                ref={modalRef}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg md:max-w-2xl border border-blue-100 animate-scale-in p-4 md:p-8 overflow-y-auto max-h-[90vh]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="quick-add-modal-title"
            >
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 id="quick-add-modal-title" className="text-2xl font-bold mb-6 text-center text-blue-700">10 Available Jobs, Education, Sectors</h2>
                {/* Top 12 Jobs */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-3 text-blue-600">Top 10 Available Jobs</h3>
                    <div className="flex flex-col gap-2">
                        {topJobs.map((job, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
                                <input
                                    ref={idx === 0 ? firstInputRef : undefined}
                                    type="text"
                                    placeholder="Position"
                                    value={job.position}
                                    onChange={e => updateTopJob(idx, 'position', e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition min-w-0"
                                />
                                <input
                                    type="number"
                                    placeholder="Vacancies"
                                    value={job.vacancies}
                                    onChange={e => updateTopJob(idx, 'vacancies', e.target.value)}
                                    className="w-full md:w-28 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition min-w-0"
                                />
                                <input
                                    type="number"
                                    placeholder="Qualified"
                                    value={job.qualified}
                                    onChange={e => updateTopJob(idx, 'qualified', e.target.value)}
                                    className="w-full md:w-28 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition min-w-0"
                                />
                                {topJobs.length > 1 && (
                                    <button
                                        type="button"
                                        className="text-red-500 ml-0 md:ml-2 hover:bg-red-50 rounded-full p-1 self-end md:self-center"
                                        onClick={() => removeTopJob(idx)}
                                        title="Remove job"
                                        tabIndex={0}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="text-blue-600 mt-2 font-medium hover:underline disabled:opacity-50"
                        onClick={addTopJob}
                        disabled={topJobs.length >= 10}
                    >
                        + Add Job
                    </button>
                </div>
                {/* Educational Background */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-3 text-blue-600">Educational Background</h3>
                    <div className="flex flex-col gap-2">
                        {(['elementary', 'secondary', 'college', 'graduate'] as (keyof Education)[]).map(level => (
                            <div key={level} className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                                <label className="w-32 capitalize text-gray-700 md:text-right md:pr-2">{level}</label>
                                <input
                                    type="number"
                                    value={education[level]}
                                    onChange={e => setEducation({ ...education, [level]: e.target.value })}
                                    className="w-full md:w-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition min-w-0"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Employment Sectors */}
                <div className="mb-8">
                    <h3 className="font-semibold mb-3 text-blue-600">Employment Sectors</h3>
                    <div className="flex flex-col gap-2">
                        {(['government', 'private', 'overseas'] as (keyof Sectors)[]).map(sector => (
                            <div key={sector} className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                                <label className="w-32 capitalize text-gray-700 md:text-right md:pr-2">{sector}</label>
                                <input
                                    type="number"
                                    value={sectors[sector]}
                                    onChange={e => setSectors({ ...sectors, [sector]: e.target.value })}
                                    className="w-full md:w-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition min-w-0"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-end gap-3 mt-6">
                    <button
                        type="button"
                        className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
            <style jsx>{`
                .animate-fade-in { animation: fadeIn 0.2s ease; }
                .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.4,0,0.2,1); }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
} 