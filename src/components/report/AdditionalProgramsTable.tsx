import { CompleteReport } from '@/types/database.types'

interface AdditionalProgramsTableProps {
    reportData: CompleteReport[];
    selectedReportIndex: number;
}

export default function AdditionalProgramsTable({ reportData, selectedReportIndex }: AdditionalProgramsTableProps) {
    // Helper function to get entry value (for non-female rows)
    const getEntryValue = (program: string, indicator: string | null = null, subIndicator: string | null = null, subSubIndicator: string | null = null, period: 'previous_report_period' | 'current_period') => {
        return reportData[selectedReportIndex].entries
            .filter(entry =>
                entry.program === program &&
                (!indicator || entry.indicator === indicator) &&
                (
                    !subIndicator || entry.sub_indicator === subIndicator || entry.sub_indicator === '' || entry.sub_indicator === null
                ) &&
                (
                    !subSubIndicator || entry.sub_sub_indicator === subSubIndicator || entry.sub_sub_indicator === '' || entry.sub_sub_indicator === null
                ) &&
                entry.sub_sub_indicator !== 'FEMALE'
            )
            .reduce((sum, entry) => sum + (entry[period] || 0), 0);
    };

    // Helper function to get female count (for female rows)
    const getFemaleCount = (program: string, indicator: string | null = null, subIndicator: string | null = null, subSubIndicator: string | null = null, period: 'previous_female_count' | 'current_female_count') => {
        return reportData[selectedReportIndex].entries
            .filter(entry =>
                entry.program === program &&
                (!indicator || entry.indicator === indicator) &&
                (
                    !subIndicator || entry.sub_indicator === subIndicator || entry.sub_indicator === '' || entry.sub_indicator === null
                ) &&
                (
                    !subSubIndicator || entry.sub_sub_indicator === subSubIndicator || entry.sub_sub_indicator === '' || entry.sub_sub_indicator === null
                ) &&
                entry.sub_sub_indicator === 'FEMALE'
            )
            .reduce((sum, entry) => sum + (entry[period] || 0), 0);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <tbody className="bg-white divide-y divide-gray-200">
                    {/* PWD Projects Section */}
                    <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4 text-sm font-semibold text-gray-900">
                            5. Number of projects implemented for PWDs
                        </td>
                    </tr>
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">5.1 Beneficiaries</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>5.1.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>
                                    {getEntryValue('PWD_PROJECTS', 'BENEFICIARIES_PWD', null, null, 'previous_report_period')}
                                </div>
                                <div className="text-pink-600">
                                    {getFemaleCount('PWD_PROJECTS', 'BENEFICIARIES_PWD', null, 'FEMALE', 'previous_female_count')}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>
                                    {getEntryValue('PWD_PROJECTS', 'BENEFICIARIES_PWD', null, null, 'current_period')}
                                </div>
                                <div className="text-pink-600">
                                    {getFemaleCount('PWD_PROJECTS', 'BENEFICIARIES_PWD', null, 'FEMALE', 'current_female_count')}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* PWD Training Section */}
                    <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4 text-sm font-semibold text-gray-900">
                            6. Training conducted for PWDs
                        </td>
                    </tr>
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">6.1 Beneficiaries</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>6.1.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>
                                    {getEntryValue('PWD_TRAINING', 'BENEFICIARIES_TRAINING', null, null, 'previous_report_period')}
                                </div>
                                <div className="text-pink-600">
                                    {getFemaleCount('PWD_TRAINING', 'BENEFICIARIES_TRAINING', null, 'FEMALE', 'previous_female_count')}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>
                                    {getEntryValue('PWD_TRAINING', 'BENEFICIARIES_TRAINING', null, null, 'current_period')}
                                </div>
                                <div className="text-pink-600">
                                    {getFemaleCount('PWD_TRAINING', 'BENEFICIARIES_TRAINING', null, 'FEMALE', 'current_female_count')}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* Applicants Counselled Section */}
                    <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4 text-sm font-semibold text-gray-900">
                            7. Total applicants counselled
                        </td>
                    </tr>
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">7.1 Total</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            {getEntryValue('APPLICANTS_COUNSELLED', 'TOTAL_COUNSELLED', null, null, 'previous_report_period')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            {getEntryValue('APPLICANTS_COUNSELLED', 'TOTAL_COUNSELLED', null, null, 'current_period')}
                        </td>
                    </tr>

                    {/* Applicants Tested Section */}
                    <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4 text-sm font-semibold text-gray-900">
                            8. Total applicants tested
                        </td>
                    </tr>
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">8.1 Total</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            {getEntryValue('APPLICANTS_TESTED', 'TOTAL_TESTED', null, null, 'previous_report_period')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            {getEntryValue('APPLICANTS_TESTED', 'TOTAL_TESTED', null, null, 'current_period')}
                        </td>
                    </tr>

                    {/* Career Guidance Section */}
                    <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4 text-sm font-semibold text-gray-900">
                            9. Career Guidance conducted
                        </td>
                    </tr>
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">9.1 Students given Career Guidance</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            {getEntryValue('CAREER_GUIDANCE', 'STUDENTS', null, null, 'previous_report_period')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            {getEntryValue('CAREER_GUIDANCE', 'STUDENTS', null, null, 'current_period')}
                        </td>
                    </tr>
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">9.2 Schools/Colleges/Universities</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            {getEntryValue('CAREER_GUIDANCE', 'INSTITUTIONS', null, null, 'previous_report_period')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            {getEntryValue('CAREER_GUIDANCE', 'INSTITUTIONS', null, null, 'current_period')}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
} 