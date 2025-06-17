import { CompleteReport } from '@/types/database.types'
import { indicatorOptions } from '@/constants/indicatorOptions'
import { subIndicatorOptions } from '@/constants/indicatorOptions'
import React from 'react'

interface ApplicantsRegisteredTableProps {
    reportData: CompleteReport[] | null
    selectedReportIndex: number
}

export default function ApplicantsRegisteredTable({ reportData, selectedReportIndex }: ApplicantsRegisteredTableProps) {
    if (!reportData || reportData.length === 0) return null

    const currentReport = reportData[selectedReportIndex]
    const entries = currentReport.entries.filter(entry => entry.program === 'APPLICANTS_REGISTERED')

    // Helper function to get entry value
    const getEntryValue = (indicator: string, subIndicator: string | null = null, subSubIndicator: string | null = null, period: 'previous_report_period' | 'current_period') => {
        return entries
            .filter(entry =>
                entry.indicator === indicator &&
                (
                    !subIndicator || entry.sub_indicator === subIndicator || (entry.sub_indicator === null && subIndicator === '') || (entry.sub_indicator === '' && subIndicator === null)
                ) &&
                (
                    !subSubIndicator || entry.sub_sub_indicator === subSubIndicator || (entry.sub_sub_indicator === null && subSubIndicator === '') || (entry.sub_sub_indicator === '' && subSubIndicator === null)
                ) &&
                entry.sub_sub_indicator !== 'FEMALE'
            )
            .reduce((sum, entry) => sum + (entry[period] || 0), 0);
    };

    // Helper function to get female count
    const getFemaleCount = (indicator: string, subIndicator: string | null = null, period: 'previous_female_count' | 'current_female_count') => {
        return entries
            .filter(entry =>
                entry.indicator === indicator &&
                (
                    !subIndicator || entry.sub_indicator === subIndicator || (entry.sub_indicator === null && subIndicator === '') || (entry.sub_indicator === '' && subIndicator === null)
                ) &&
                entry.sub_sub_indicator && entry.sub_sub_indicator.includes('FEMALE')
            )
            .reduce((sum, entry) => sum + (entry[period] || 0), 0);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <tbody className="bg-white divide-y divide-gray-200">
                    {/* Applicants Registered Section Header */}
                    <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4 text-sm font-semibold text-gray-900">
                            2. Applicants registered
                        </td>
                    </tr>

                    {/* Regular Program */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">2.1 Regular Program</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>2.1.1 Total</div>
                                <div className="ml-4">2.1.1.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('REGULAR_PROGRAM_2', null, null, 'previous_report_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('REGULAR_PROGRAM_2', null, 'previous_female_count')}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('REGULAR_PROGRAM_2', null, null, 'current_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('REGULAR_PROGRAM_2', null, 'current_female_count')}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* SPES */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">2.2 SPES</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>2.2.1 Total</div>
                                <div className="ml-4">2.2.1.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('SPES_2', null, null, 'previous_report_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('SPES_2', null, 'previous_female_count')}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('SPES_2', null, null, 'current_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('SPES_2', null, 'current_female_count')}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* WAP */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">2.3 WAP</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>2.3.1 Total</div>
                                <div className="ml-4">2.3.1.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('WAP_2', null, null, 'previous_report_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('WAP_2', null, 'previous_female_count')}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div>{getEntryValue('WAP_2', null, null, 'current_period')}</div>
                                <div className="text-pink-600">
                                    {getFemaleCount('WAP_2', null, 'current_female_count')}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* TULAY */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">2.4 TULAY 2000</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>2.4.1 Wage employment</div>
                                <div className="ml-4">2.4.1.1 Female</div>
                                <div>2.4.2 Self-employment</div>
                                <div className="ml-4">2.4.2.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['WAGE_EMPLOYMENT_2', 'SELF_EMPLOYMENT_2'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {getEntryValue('TULAY_2', type, null, 'previous_report_period')}
                                        </div>
                                        <div className="text-pink-600">
                                            {getFemaleCount('TULAY_2', type, 'previous_female_count')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['WAGE_EMPLOYMENT_2', 'SELF_EMPLOYMENT_2'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {getEntryValue('TULAY_2', type, null, 'current_period')}
                                        </div>
                                        <div className="text-pink-600">
                                            {getFemaleCount('TULAY_2', type, 'current_female_count')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>

                    {/* Special Categories */}
                    {['RETRENCHED_2', 'OFWS_2', 'MIGRATORY_2', 'RURAL_2'].map((category, index) => (
                        <tr key={category}>
                            <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                            <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">
                                {`2.${index + 5} ${category === 'RETRENCHED_2' ? 'Retrenched/Displaced Workers' :
                                    category === 'OFWS_2' ? 'Returning OFWs' :
                                        category === 'MIGRATORY_2' ? 'Migratory Workers' :
                                            'Rural Workers'}`}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                                <div className="space-y-2">
                                    <div>Total</div>
                                    <div className="ml-4">{`2.${index + 5}.1 Female`}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                                <div className="space-y-2">
                                    <div>{getEntryValue(category, null, null, 'previous_report_period')}</div>
                                    <div className="text-pink-600">
                                        {getFemaleCount(category, null, 'previous_female_count')}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                                <div className="space-y-2">
                                    <div>{getEntryValue(category, null, null, 'current_period')}</div>
                                    <div className="text-pink-600">
                                        {getFemaleCount(category, null, 'current_female_count')}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {/* Summary Row */}
                    <tr className="bg-gray-50">
                        <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-gray-900">Total Applicants Registered</td>
                        <td className="px-6 py-4 text-sm text-gray-900"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div>
                                {entries
                                    .filter(entry => !entry.sub_sub_indicator)
                                    .reduce((sum, entry) => sum + (entry.previous_report_period || 0), 0)}
                            </div>
                            <div className="text-pink-600">
                                {entries
                                    .filter(entry => entry.sub_sub_indicator && entry.sub_sub_indicator.includes('FEMALE'))
                                    .reduce((sum, entry) => sum + (entry.previous_female_count || 0), 0)}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div>
                                {entries
                                    .filter(entry => !entry.sub_sub_indicator)
                                    .reduce((sum, entry) => sum + (entry.current_period || 0), 0)}
                            </div>
                            <div className="text-pink-600">
                                {entries
                                    .filter(entry => entry.sub_sub_indicator && entry.sub_sub_indicator.includes('FEMALE'))
                                    .reduce((sum, entry) => sum + (entry.current_female_count || 0), 0)}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
} 