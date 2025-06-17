import React, { useState, useRef, useEffect } from 'react';

export interface TopJob {
    position: string;
    vacancies: string;
    qualified: string;
}

interface AvailableJobsModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (jobs: TopJob[]) => void;
    initialJobs?: TopJob[];
}

export default function AvailableJobsModal({ open, onClose, onSave, initialJobs }: AvailableJobsModalProps) {
    const [topJobs, setTopJobs] = useState<TopJob[]>(initialJobs || [{ position: '', vacancies: '', qualified: '' }]);
    const firstInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) setTimeout(() => firstInputRef.current?.focus(), 100);
    }, [open]);

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
        onSave(topJobs);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 sm:p-0 relative animate-fadeIn">
                <button
                    type="button"
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors text-2xl focus:outline-none z-10"
                    aria-label="Close modal"
                    onClick={onClose}
                >
                    ×
                </button>
                <div className="flex flex-col h-[90vh] max-h-[700px]">
                    <div className="px-8 pt-8 pb-2 shrink-0">
                        <h2 className="text-2xl font-bold mb-2 text-center text-blue-800 tracking-tight">12. Available Jobs</h2>
                        <p className="text-center text-gray-500 mb-4">List the top 10 available jobs for this period.</p>
                        <h3 className="font-semibold mb-3 text-blue-700 text-lg">Top 10 Available Jobs</h3>
                    </div>
                    <div className="overflow-y-auto px-8 pb-2 grow" style={{ maxHeight: '340px' }}>
                        <div className="overflow-x-auto">
                            <div className="grid grid-cols-12 gap-2 px-1 pb-2 border-b border-gray-200 text-xs font-semibold text-gray-600 sticky top-0 bg-white z-10">
                                <div className="col-span-5">Position</div>
                                <div className="col-span-3 text-center">Vacancies</div>
                                <div className="col-span-3 text-center">Qualified</div>
                                <div className="col-span-1"></div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {topJobs.map((job, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                        <input
                                            ref={idx === 0 ? firstInputRef : undefined}
                                            type="text"
                                            placeholder="Position"
                                            value={job.position}
                                            onChange={e => updateTopJob(idx, 'position', e.target.value)}
                                            className="col-span-5 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-colors text-sm"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Vacancies"
                                            value={job.vacancies}
                                            min={0}
                                            onChange={e => updateTopJob(idx, 'vacancies', e.target.value)}
                                            className="col-span-3 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-colors text-sm text-center"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Qualified"
                                            value={job.qualified}
                                            min={0}
                                            onChange={e => updateTopJob(idx, 'qualified', e.target.value)}
                                            className="col-span-3 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-colors text-sm text-center"
                                        />
                                        {topJobs.length > 1 && (
                                            <button
                                                type="button"
                                                className="col-span-1 text-red-500 hover:bg-red-50 rounded-full p-1 transition-colors focus:outline-none"
                                                aria-label="Remove job"
                                                onClick={() => removeTopJob(idx)}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="px-8 pt-2 pb-4 shrink-0 bg-white">
                        <button
                            type="button"
                            className="w-full py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                            onClick={addTopJob}
                            disabled={topJobs.length >= 10}
                        >
                            + Add Job
                        </button>
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