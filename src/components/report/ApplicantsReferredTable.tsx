import { CompleteReport } from '@/types/database.types'
import { indicatorOptions } from '@/constants/indicatorOptions'
import { subIndicatorOptions } from '@/constants/indicatorOptions'

interface ApplicantsReferredTableProps {
    reportData: CompleteReport[];
    selectedReportIndex: number;
}

export default function ApplicantsReferredTable({ reportData, selectedReportIndex }: ApplicantsReferredTableProps) {
    // Helper function to get entry value (for non-female rows)
    const getEntryValue = (program: string, indicator: string | null = null, subIndicator: string | null = null, subSubIndicator: string | null = null, period: 'previous_report_period' | 'current_period') => {
        const entries = reportData[selectedReportIndex].entries
            .filter(entry =>
                entry.program === program &&
                (!indicator || entry.indicator === indicator) &&
                (!subIndicator || entry.sub_indicator === subIndicator) &&
                (!subSubIndicator || entry.sub_sub_indicator === subSubIndicator) &&
                entry.sub_sub_indicator !== 'FEMALE'
            );
        return entries.reduce((sum, entry) => sum + (entry[period] || 0), 0);
    };

    // Helper function to get female count (for female rows)
    const getFemaleCount = (program: string, indicator: string | null = null, subIndicator: string | null = null, subSubIndicator: string | null = null, period: 'previous_female_count' | 'current_female_count') => {
        const entries = reportData[selectedReportIndex].entries
            .filter(entry =>
                entry.program === program &&
                (!indicator || entry.indicator === indicator) &&
                (!subIndicator || entry.sub_indicator === subIndicator) &&
                (!subSubIndicator || entry.sub_sub_indicator === subSubIndicator) &&
                entry.sub_sub_indicator === 'FEMALE'
            );
        return entries.reduce((sum, entry) => sum + (entry[period] || 0), 0);
    };

    // Helper function to get total for all indicators (non-female rows)
    const getTotalValue = (program: string, period: 'previous_report_period' | 'current_period') => {
        const entries = reportData[selectedReportIndex].entries
            .filter(entry =>
                entry.program === program &&
                entry.sub_sub_indicator !== 'FEMALE'
            );
        return entries.reduce((sum, entry) => sum + (entry[period] || 0), 0);
    };

    // Helper function to get total female for all indicators
    const getTotalFemaleValue = (program: string, period: 'previous_female_count' | 'current_female_count') => {
        const entries = reportData[selectedReportIndex].entries
            .filter(entry =>
                entry.program === program &&
                entry.sub_sub_indicator === 'FEMALE'
            );
        return entries.reduce((sum, entry) => sum + (entry[period] || 0), 0);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <tbody className="bg-white divide-y divide-gray-200">
                    {/* Applicants Referred Section Header */}
                    <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4 text-sm font-semibold text-gray-900">
                            3. Applicants referred
                        </td>
                    </tr>

                    {/* Regular Program */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">3.1 Regular Program</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>3.1.1 Local Employment</div>
                                <div className="ml-4">3.1.1.1 Female</div>
                                <div>3.1.2 Overseas employment</div>
                                <div className="ml-4">3.1.2.1 Female</div>
                                <div>3.1.3 Self-employment</div>
                                <div className="ml-4">3.1.3.1 Female</div>
                                <div>3.1.4 Training</div>
                                <div className="ml-4">3.1.4.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LOCAL_EMPLOYMENT_REFERRED', 'OVERSEAS_EMPLOYMENT_REFERRED', 'SELF_EMPLOYMENT_REFERRED', 'TRAINING_REFERRED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {getEntryValue('APPLICANTS_REFERRED', 'REGULAR_PROGRAM_REFERRED', type, null, 'previous_report_period')}
                                        </div>
                                        <div className="text-pink-600">
                                            {getFemaleCount('APPLICANTS_REFERRED', 'REGULAR_PROGRAM_REFERRED', type, null, 'previous_female_count')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LOCAL_EMPLOYMENT_REFERRED', 'OVERSEAS_EMPLOYMENT_REFERRED', 'SELF_EMPLOYMENT_REFERRED', 'TRAINING_REFERRED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {getEntryValue('APPLICANTS_REFERRED', 'REGULAR_PROGRAM_REFERRED', type, null, 'current_period')}
                                        </div>
                                        <div className="text-pink-600">
                                            {getFemaleCount('APPLICANTS_REFERRED', 'REGULAR_PROGRAM_REFERRED', type, null, 'current_female_count')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>

                    {/* SPES */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">3.2 SPES</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>3.2.1 Total</div>
                                <div className="ml-4">3.2.1.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('APPLICANTS_REFERRED', 'SPES_REFERRED', null, null, 'previous_report_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('APPLICANTS_REFERRED', 'SPES_REFERRED', null, null, 'previous_female_count')}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('APPLICANTS_REFERRED', 'SPES_REFERRED', null, null, 'current_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('APPLICANTS_REFERRED', 'SPES_REFERRED', null, null, 'current_female_count')}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* WAP */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">3.3 WAP</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>3.3.1 Total</div>
                                <div className="ml-4">3.3.1.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('APPLICANTS_REFERRED', 'WAP_REFERRED', null, null, 'previous_report_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('APPLICANTS_REFERRED', 'WAP_REFERRED', null, null, 'previous_female_count')}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('APPLICANTS_REFERRED', 'WAP_REFERRED', null, null, 'current_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('APPLICANTS_REFERRED', 'WAP_REFERRED', null, null, 'current_female_count')}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* TULAY 2000 */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">3.4 TULAY 2000</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>3.4.1 Wage employment</div>
                                <div className="ml-4">3.4.1.1 Total</div>
                                <div className="ml-8">3.4.1.1.1 Female</div>
                                <div>3.4.2 Self-employment</div>
                                <div className="ml-4">3.4.2.1 Total</div>
                                <div className="ml-8">3.4.2.1.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['WAGE_EMPLOYMENT_REFERRED', 'SELF_EMPLOYMENT_TULAY_REFERRED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {getEntryValue('APPLICANTS_REFERRED', 'TULAY_REFERRED', type, null, 'previous_report_period')}
                                        </div>
                                        <div>
                                            {getEntryValue('APPLICANTS_REFERRED', 'TULAY_REFERRED', type, null, 'previous_report_period')}
                                        </div>
                                        <div className="text-pink-600">
                                            {getFemaleCount('APPLICANTS_REFERRED', 'TULAY_REFERRED', type, null, 'previous_female_count')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['WAGE_EMPLOYMENT_REFERRED', 'SELF_EMPLOYMENT_TULAY_REFERRED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {getEntryValue('APPLICANTS_REFERRED', 'TULAY_REFERRED', type, null, 'current_period')}
                                        </div>
                                        <div>
                                            {getEntryValue('APPLICANTS_REFERRED', 'TULAY_REFERRED', type, null, 'current_period')}
                                        </div>
                                        <div className="text-pink-600">
                                            {getFemaleCount('APPLICANTS_REFERRED', 'TULAY_REFERRED', type, null, 'current_female_count')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>

                    {/* Retrenched/Displaced Workers */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">3.5 Retrenched/Displaced Workers</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>3.5.1 Total</div>
                                <div className="ml-4">3.5.1.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('APPLICANTS_REFERRED', 'RETRENCHED_REFERRED', null, null, 'previous_report_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('APPLICANTS_REFERRED', 'RETRENCHED_REFERRED', null, null, 'previous_female_count')}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('APPLICANTS_REFERRED', 'RETRENCHED_REFERRED', null, null, 'current_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('APPLICANTS_REFERRED', 'RETRENCHED_REFERRED', null, null, 'current_female_count')}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* Returning OFWs */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">3.6 Returning OFWs</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>3.6.1 Total</div>
                                <div className="ml-4">3.6.1.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('APPLICANTS_REFERRED', 'OFWS_REFERRED', null, null, 'previous_report_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('APPLICANTS_REFERRED', 'OFWS_REFERRED', null, null, 'previous_female_count')}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('APPLICANTS_REFERRED', 'OFWS_REFERRED', null, null, 'current_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('APPLICANTS_REFERRED', 'OFWS_REFERRED', null, null, 'current_female_count')}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* Migratory Workers */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">3.7 Migratory Workers</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>3.7.1 Total</div>
                                <div className="ml-4">3.7.1.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('APPLICANTS_REFERRED', 'MIGRATORY_REFERRED', null, null, 'previous_report_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('APPLICANTS_REFERRED', 'MIGRATORY_REFERRED', null, null, 'previous_female_count')}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('APPLICANTS_REFERRED', 'MIGRATORY_REFERRED', null, null, 'current_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('APPLICANTS_REFERRED', 'MIGRATORY_REFERRED', null, null, 'current_female_count')}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* Rural Workers */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">3.8 Rural Workers</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>3.8.1 Total</div>
                                <div className="ml-4">3.8.1.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('APPLICANTS_REFERRED', 'RURAL_REFERRED', null, null, 'previous_report_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('APPLICANTS_REFERRED', 'RURAL_REFERRED', null, null, 'previous_female_count')}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('APPLICANTS_REFERRED', 'RURAL_REFERRED', null, null, 'current_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('APPLICANTS_REFERRED', 'RURAL_REFERRED', null, null, 'current_female_count')}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* Summary Row */}
                    <tr className="bg-gray-50">
                        <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-gray-900">Total Applicants Referred</td>
                        <td className="px-6 py-4 text-sm text-gray-900"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div>
                                {getTotalValue('APPLICANTS_REFERRED', 'previous_report_period')}
                            </div>
                            <div className="text-pink-600">
                                {getTotalFemaleValue('APPLICANTS_REFERRED', 'previous_female_count')}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div>
                                {getTotalValue('APPLICANTS_REFERRED', 'current_period')}
                            </div>
                            <div className="text-pink-600">
                                {getTotalFemaleValue('APPLICANTS_REFERRED', 'current_female_count')}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
} 