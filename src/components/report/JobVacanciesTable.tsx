import { CompleteReport } from '@/types/database.types'

interface JobVacanciesTableProps {
    reportData: CompleteReport[];
    selectedReportIndex: number;
}

export default function JobVacanciesTable({ reportData, selectedReportIndex }: JobVacanciesTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="px-6 py-4 text-left border-b border-gray-200 font-semibold text-gray-900 w-[8%]">KRA</th>
                        <th className="px-6 py-4 text-left border-b border-gray-200 font-semibold text-gray-900 w-[20%]">INDICATOR</th>
                        <th className="px-6 py-4 text-left border-b border-gray-200 font-semibold text-gray-900 w-[35%]">
                            <div>OTHER SPECIFICATION</div>
                        </th>
                        <th className="px-6 py-4 text-center border-b border-gray-200 font-semibold text-gray-900 w-[12%]">
                            <div>PREVIOUS</div>
                            <div className="text-xs font-normal text-gray-500">REPORTING PERIOD</div>
                        </th>
                        <th className="px-6 py-4 text-center border-b border-gray-200 font-semibold text-gray-900 w-[12%]">
                            <div>CURRENT</div>
                            <div className="text-xs font-normal text-gray-500">REPORTING PERIOD</div>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {/* Job Vacancies Section */}
                    <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4 text-sm font-semibold text-gray-900">
                            1. Job vacancies solicited/reported
                        </td>
                    </tr>

                    {/* Regular Program */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900"></td>
                        <td className="px-6 py-4 text-sm text-gray-900">1.1 Regular Program</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="space-y-2">
                                <div>1.1.1 Local employment</div>
                                <div className="ml-4">1.1.1.1 Female</div>
                                <div>1.1.2 Overseas employment</div>
                                <div className="ml-4">1.1.2.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div className="space-y-2">
                                <div>
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'REGULAR_PROGRAM' &&
                                            e.sub_indicator === 'LOCAL_EMPLOYMENT' &&
                                            !e.sub_sub_indicator
                                        );
                                        return entry ? (entry.previous_report_period || 0) : 0;
                                    })()}
                                </div>
                                <div className="text-pink-600">
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'REGULAR_PROGRAM' &&
                                            e.sub_indicator === 'LOCAL_EMPLOYMENT' &&
                                            e.sub_sub_indicator === 'FEMALE'
                                        );
                                        return entry ? (entry.previous_female_count || 0) : 0;
                                    })()}
                                </div>
                                <div>
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'REGULAR_PROGRAM' &&
                                            e.sub_indicator === 'OVERSEAS_EMPLOYMENT' &&
                                            !e.sub_sub_indicator
                                        );
                                        return entry ? (entry.previous_report_period || 0) : 0;
                                    })()}
                                </div>
                                <div className="text-pink-600">
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'REGULAR_PROGRAM' &&
                                            e.sub_indicator === 'OVERSEAS_EMPLOYMENT' &&
                                            e.sub_sub_indicator === 'FEMALE'
                                        );
                                        return entry ? (entry.previous_female_count || 0) : 0;
                                    })()}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div className="space-y-2">
                                <div>
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'REGULAR_PROGRAM' &&
                                            e.sub_indicator === 'LOCAL_EMPLOYMENT' &&
                                            !e.sub_sub_indicator
                                        );
                                        return entry ? (entry.current_period || 0) : 0;
                                    })()}
                                </div>
                                <div className="text-pink-600">
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'REGULAR_PROGRAM' &&
                                            e.sub_indicator === 'LOCAL_EMPLOYMENT' &&
                                            e.sub_sub_indicator === 'FEMALE'
                                        );
                                        return entry ? (entry.current_female_count || 0) : 0;
                                    })()}
                                </div>
                                <div>
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'REGULAR_PROGRAM' &&
                                            e.sub_indicator === 'OVERSEAS_EMPLOYMENT' &&
                                            !e.sub_sub_indicator
                                        );
                                        return entry ? (entry.current_period || 0) : 0;
                                    })()}
                                </div>
                                <div className="text-pink-600">
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'REGULAR_PROGRAM' &&
                                            e.sub_indicator === 'OVERSEAS_EMPLOYMENT' &&
                                            e.sub_sub_indicator === 'FEMALE'
                                        );
                                        return entry ? (entry.current_female_count || 0) : 0;
                                    })()}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* SPES */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900"></td>
                        <td className="px-6 py-4 text-sm text-gray-900">1.2 SPES</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="space-y-2">
                                <div>1.2.1 Public Sector</div>
                                <div className="ml-4">1.2.1.1 Female</div>
                                <div>1.2.2 Private Sector</div>
                                <div className="ml-4">1.2.2.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div className="space-y-2">
                                <div>
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'SPES' &&
                                            e.sub_indicator === 'PUBLIC_SECTOR' &&
                                            !e.sub_sub_indicator
                                        );
                                        return entry ? (entry.previous_report_period || 0) : 0;
                                    })()}
                                </div>
                                <div className="text-pink-600">
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'SPES' &&
                                            e.sub_indicator === 'PUBLIC_SECTOR' &&
                                            e.sub_sub_indicator === 'FEMALE'
                                        );
                                        return entry ? (entry.previous_female_count || 0) : 0;
                                    })()}
                                </div>
                                <div>
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'SPES' &&
                                            e.sub_indicator === 'PRIVATE_SECTOR' &&
                                            !e.sub_sub_indicator
                                        );
                                        return entry ? (entry.previous_report_period || 0) : 0;
                                    })()}
                                </div>
                                <div className="text-pink-600">
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'SPES' &&
                                            e.sub_indicator === 'PRIVATE_SECTOR' &&
                                            e.sub_sub_indicator === 'FEMALE'
                                        );
                                        return entry ? (entry.previous_female_count || 0) : 0;
                                    })()}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div className="space-y-2">
                                <div>
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'SPES' &&
                                            e.sub_indicator === 'PUBLIC_SECTOR' &&
                                            !e.sub_sub_indicator
                                        );
                                        return entry ? (entry.current_period || 0) : 0;
                                    })()}
                                </div>
                                <div className="text-pink-600">
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'SPES' &&
                                            e.sub_indicator === 'PUBLIC_SECTOR' &&
                                            e.sub_sub_indicator === 'FEMALE'
                                        );
                                        return entry ? (entry.current_female_count || 0) : 0;
                                    })()}
                                </div>
                                <div>
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'SPES' &&
                                            e.sub_indicator === 'PRIVATE_SECTOR' &&
                                            !e.sub_sub_indicator
                                        );
                                        return entry ? (entry.current_period || 0) : 0;
                                    })()}
                                </div>
                                <div className="text-pink-600">
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'SPES' &&
                                            e.sub_indicator === 'PRIVATE_SECTOR' &&
                                            e.sub_sub_indicator === 'FEMALE'
                                        );
                                        return entry ? (entry.current_female_count || 0) : 0;
                                    })()}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* WAP */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900"></td>
                        <td className="px-6 py-4 text-sm text-gray-900">1.3 WAP (Work Appreciation Program)</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="space-y-2">
                                <div>1.3.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div className="space-y-2">
                                <div className="text-pink-600">
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'WAP' &&
                                            e.sub_sub_indicator === 'FEMALE'
                                        );
                                        return entry ? (entry.previous_female_count || 0) : 0;
                                    })()}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div className="space-y-2">
                                <div className="text-pink-600">
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'WAP' &&
                                            e.sub_sub_indicator === 'FEMALE'
                                        );
                                        return entry ? (entry.current_female_count || 0) : 0;
                                    })()}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* TULAY */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900"></td>
                        <td className="px-6 py-4 text-sm text-gray-900">1.4 TULAY</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="space-y-2">
                                <div>1.4.1 Wage employment</div>
                                <div className="ml-4">1.4.1.1 Female</div>
                                <div>1.4.2 Self-employment</div>
                                <div className="ml-4">1.4.2.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div className="space-y-2">
                                <div>
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'TULAY' &&
                                            e.sub_indicator === 'WAGE_EMPLOYMENT' &&
                                            !e.sub_sub_indicator
                                        );
                                        return entry ? (entry.previous_report_period || 0) : 0;
                                    })()}
                                </div>
                                <div className="text-pink-600">
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'TULAY' &&
                                            e.sub_indicator === 'WAGE_EMPLOYMENT' &&
                                            e.sub_sub_indicator === 'FEMALE'
                                        );
                                        return entry ? (entry.previous_female_count || 0) : 0;
                                    })()}
                                </div>
                                <div>
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'TULAY' &&
                                            e.sub_indicator === 'SELF_EMPLOYMENT' &&
                                            !e.sub_sub_indicator
                                        );
                                        return entry ? (entry.previous_report_period || 0) : 0;
                                    })()}
                                </div>
                                <div className="text-pink-600">
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'TULAY' &&
                                            e.sub_indicator === 'SELF_EMPLOYMENT' &&
                                            e.sub_sub_indicator === 'FEMALE'
                                        );
                                        return entry ? (entry.previous_female_count || 0) : 0;
                                    })()}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div className="space-y-2">
                                <div>
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'TULAY' &&
                                            e.sub_indicator === 'WAGE_EMPLOYMENT' &&
                                            !e.sub_sub_indicator
                                        );
                                        return entry ? (entry.current_period || 0) : 0;
                                    })()}
                                </div>
                                <div className="text-pink-600">
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'TULAY' &&
                                            e.sub_indicator === 'WAGE_EMPLOYMENT' &&
                                            e.sub_sub_indicator === 'FEMALE'
                                        );
                                        return entry ? (entry.current_female_count || 0) : 0;
                                    })()}
                                </div>
                                <div>
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'TULAY' &&
                                            e.sub_indicator === 'SELF_EMPLOYMENT' &&
                                            !e.sub_sub_indicator
                                        );
                                        return entry ? (entry.current_period || 0) : 0;
                                    })()}
                                </div>
                                <div className="text-pink-600">
                                    {(() => {
                                        const entry = reportData[selectedReportIndex].entries.find(e =>
                                            e.program === 'JOB_VACANCIES' &&
                                            e.indicator === 'TULAY' &&
                                            e.sub_indicator === 'SELF_EMPLOYMENT' &&
                                            e.sub_sub_indicator === 'FEMALE'
                                        );
                                        return entry ? (entry.current_female_count || 0) : 0;
                                    })()}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* Summary Row */}
                    <tr className="bg-gray-50">
                        <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-gray-900">Total Job Vacancies</td>
                        <td className="px-6 py-4 text-sm text-gray-900"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div>
                                {reportData[selectedReportIndex].entries
                                    .filter(entry => entry.program === 'JOB_VACANCIES' &&
                                        !entry.sub_sub_indicator)
                                    .reduce((sum, entry) => sum + (entry.previous_report_period || 0), 0)}
                            </div>
                            <div className="text-pink-600">
                                {reportData[selectedReportIndex].entries
                                    .filter(entry => entry.program === 'JOB_VACANCIES' &&
                                        entry.sub_sub_indicator === 'FEMALE')
                                    .reduce((sum, entry) => sum + (entry.previous_female_count || 0), 0)}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div>
                                {reportData[selectedReportIndex].entries
                                    .filter(entry => entry.program === 'JOB_VACANCIES' &&
                                        !entry.sub_sub_indicator)
                                    .reduce((sum, entry) => sum + (entry.current_period || 0), 0)}
                            </div>
                            <div className="text-pink-600">
                                {reportData[selectedReportIndex].entries
                                    .filter(entry => entry.program === 'JOB_VACANCIES' &&
                                        entry.sub_sub_indicator === 'FEMALE')
                                    .reduce((sum, entry) => sum + (entry.current_female_count || 0), 0)}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
} 