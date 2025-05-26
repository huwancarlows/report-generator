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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">12. Available Jobs</h2>
                <div className="mb-8">
                    <h3 className="font-semibold mb-3 text-blue-600">Top 10 Available Jobs</h3>
                    <div className="flex flex-col gap-2">
                        {topJobs.map((job, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    ref={idx === 0 ? firstInputRef : undefined}
                                    type="text"
                                    placeholder="Position"
                                    value={job.position}
                                    onChange={e => updateTopJob(idx, 'position', e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                />
                                <input
                                    type="number"
                                    placeholder="Vacancies"
                                    value={job.vacancies}
                                    onChange={e => updateTopJob(idx, 'vacancies', e.target.value)}
                                    className="w-24 border border-gray-300 rounded-lg px-3 py-2"
                                />
                                <input
                                    type="number"
                                    placeholder="Qualified"
                                    value={job.qualified}
                                    onChange={e => updateTopJob(idx, 'qualified', e.target.value)}
                                    className="w-24 border border-gray-300 rounded-lg px-3 py-2"
                                />
                                {topJobs.length > 1 && (
                                    <button type="button" className="text-red-500" onClick={() => removeTopJob(idx)}>
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button type="button" className="text-blue-600 mt-2" onClick={addTopJob} disabled={topJobs.length >= 10}>
                        + Add Job
                    </button>
                </div>
                <div className="flex justify-end gap-3">
                    <button type="button" className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg" onClick={onClose}>Cancel</button>
                    <button type="button" className="px-5 py-2 bg-blue-600 text-white rounded-lg" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
} 