import { CompleteReport } from '@/types/database.types'

interface JobsFairTableProps {
    reportData: CompleteReport[];
    selectedReportIndex: number;
}

export default function JobsFairTable({ reportData, selectedReportIndex }: JobsFairTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <tbody className="bg-white divide-y divide-gray-200">
                    {/* Jobs Fair Section Header */}
                    <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4 text-sm font-semibold text-gray-900">
                            10. Jobs fair
                        </td>
                    </tr>

                    {/* 10.1 Jobs fair conducted/assisted */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">10.1 Jobs fair conducted/assisted</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>10.1.1 Local Government Units</div>
                                <div>10.1.2 Private Institutions</div>
                                <div>10.1.3 Schools</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LGU', 'PRIVATE', 'SCHOOLS'].map((type) => (
                                    <div key={type}>
                                        {reportData[selectedReportIndex].entries
                                            .filter(entry => entry.program === 'JOB_FAIR' &&
                                                entry.indicator === 'JOBS_FAIR_CONDUCTED' &&
                                                entry.sub_indicator === type)
                                            .map(entry => entry.previous_report_period)}
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LGU', 'PRIVATE', 'SCHOOLS'].map((type) => (
                                    <div key={type}>
                                        {reportData[selectedReportIndex].entries
                                            .filter(entry => entry.program === 'JOB_FAIR' &&
                                                entry.indicator === 'JOBS_FAIR_CONDUCTED' &&
                                                entry.sub_indicator === type)
                                            .map(entry => entry.current_period)}
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>

                    {/* 10.2 Types */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">10.2 Types</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>10.2.1 Local employment</div>
                                <div>10.2.2 Overseas employment</div>
                                <div>10.2.3 Local and Overseas employment</div>
                                <div>10.2.4 PWDs and other disadvantaged groups</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LOCAL', 'OVERSEAS', 'BOTH', 'PWD'].map((type) => (
                                    <div key={type}>
                                        {reportData[selectedReportIndex].entries
                                            .filter(entry => entry.program === 'JOB_FAIR' &&
                                                entry.indicator === 'JOBS_FAIR_TYPES' &&
                                                entry.sub_indicator === type)
                                            .map(entry => entry.previous_report_period)}
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LOCAL', 'OVERSEAS', 'BOTH', 'PWD'].map((type) => (
                                    <div key={type}>
                                        {reportData[selectedReportIndex].entries
                                            .filter(entry => entry.program === 'JOB_FAIR' &&
                                                entry.indicator === 'JOBS_FAIR_TYPES' &&
                                                entry.sub_indicator === type)
                                            .map(entry => entry.current_period)}
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>

                    {/* 10.3 Job vacancies solicited */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">10.3 Job vacancies solicited</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>10.3.1 Local employment</div>
                                <div>10.3.2 Overseas employment</div>
                                <div>10.3.3 Local and Overseas employment</div>
                                <div>10.3.4 PWDs and other disadvantaged groups</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LOCAL', 'OVERSEAS', 'BOTH', 'PWD'].map((type) => (
                                    <div key={type}>
                                        {reportData[selectedReportIndex].entries
                                            .filter(entry => entry.program === 'JOB_FAIR' &&
                                                entry.indicator === 'JOB_VACANCIES_FAIR' &&
                                                entry.sub_indicator === type)
                                            .map(entry => entry.previous_report_period)}
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LOCAL', 'OVERSEAS', 'BOTH', 'PWD'].map((type) => (
                                    <div key={type}>
                                        {reportData[selectedReportIndex].entries
                                            .filter(entry => entry.program === 'JOB_FAIR' &&
                                                entry.indicator === 'JOB_VACANCIES_FAIR' &&
                                                entry.sub_indicator === type)
                                            .map(entry => entry.current_period)}
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>

                    {/* 10.4 Job applicants registered */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">10.4 Job applicants registered</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>10.4.1 Local employment</div>
                                <div className="ml-4">10.4.1.1 Female</div>
                                <div>10.4.2 Overseas employment</div>
                                <div className="ml-4">10.4.2.1 Female</div>
                                <div>10.4.3 Local and Overseas employment</div>
                                <div className="ml-4">10.4.3.1 Female</div>
                                <div>10.4.4 PWDs and other disadvantaged groups</div>
                                <div className="ml-4">10.4.4.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LOCAL_APPLICANTS', 'OVERSEAS_APPLICANTS', 'BOTH_APPLICANTS', 'PWD_APPLICANTS'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'JOB_APPLICANTS_FAIR' &&
                                                    entry.sub_indicator === type &&
                                                    !entry.sub_sub_indicator)
                                                .map(entry => entry.previous_report_period)}
                                        </div>
                                        <div className="text-pink-600">
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'JOB_APPLICANTS_FAIR' &&
                                                    entry.sub_indicator === type &&
                                                    entry.sub_sub_indicator === 'FEMALE')
                                                .map(entry => entry.previous_report_period)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LOCAL_APPLICANTS', 'OVERSEAS_APPLICANTS', 'BOTH_APPLICANTS', 'PWD_APPLICANTS'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'JOB_APPLICANTS_FAIR' &&
                                                    entry.sub_indicator === type &&
                                                    !entry.sub_sub_indicator)
                                                .map(entry => entry.current_period)}
                                        </div>
                                        <div className="text-pink-600">
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'JOB_APPLICANTS_FAIR' &&
                                                    entry.sub_indicator === type &&
                                                    entry.sub_sub_indicator === 'FEMALE')
                                                .map(entry => entry.current_period)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>

                    {/* 10.5 Job applicants hired on the spot */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">10.5 Job applicants hired on the spot</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>10.5.1 Local employment</div>
                                <div className="ml-4">10.5.1.1 Female</div>
                                <div>10.5.2 Overseas employment</div>
                                <div className="ml-4">10.5.2.1 Female</div>
                                <div>10.5.3 Local and Overseas employment</div>
                                <div className="ml-4">10.5.3.1 Female</div>
                                <div>10.5.4 PWDs and other disadvantaged groups</div>
                                <div className="ml-4">10.5.4.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LOCAL_HIRED', 'OVERSEAS_HIRED', 'BOTH_HIRED', 'PWD_HIRED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'HIRED_ON_SPOT' &&
                                                    entry.sub_indicator === type &&
                                                    !entry.sub_sub_indicator)
                                                .map(entry => entry.previous_report_period)}
                                        </div>
                                        <div className="text-pink-600">
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'HIRED_ON_SPOT' &&
                                                    entry.sub_indicator === type &&
                                                    entry.sub_sub_indicator === 'FEMALE')
                                                .map(entry => entry.previous_report_period)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LOCAL_HIRED', 'OVERSEAS_HIRED', 'BOTH_HIRED', 'PWD_HIRED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'HIRED_ON_SPOT' &&
                                                    entry.sub_indicator === type &&
                                                    !entry.sub_sub_indicator)
                                                .map(entry => entry.current_period)}
                                        </div>
                                        <div className="text-pink-600">
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'HIRED_ON_SPOT' &&
                                                    entry.sub_indicator === type &&
                                                    entry.sub_sub_indicator === 'FEMALE')
                                                .map(entry => entry.current_period)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>

                    {/* 10.6 Job applicants reported placed */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">10.6 Job applicants reported placed</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>10.6.1 Local employment</div>
                                <div className="ml-4">10.6.1.1 Female</div>
                                <div>10.6.2 Overseas employment</div>
                                <div className="ml-4">10.6.2.1 Female</div>
                                <div>10.6.3 Local and Overseas employment</div>
                                <div className="ml-4">10.6.3.1 Female</div>
                                <div>10.6.4 PWDs and other disadvantaged groups</div>
                                <div className="ml-4">10.6.4.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LOCAL_PLACED', 'OVERSEAS_PLACED', 'BOTH_PLACED', 'PWD_PLACED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'REPORTED_PLACED' &&
                                                    entry.sub_indicator === type &&
                                                    !entry.sub_sub_indicator)
                                                .map(entry => entry.previous_report_period)}
                                        </div>
                                        <div className="text-pink-600">
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'REPORTED_PLACED' &&
                                                    entry.sub_indicator === type &&
                                                    entry.sub_sub_indicator === 'FEMALE')
                                                .map(entry => entry.previous_report_period)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LOCAL_PLACED', 'OVERSEAS_PLACED', 'BOTH_PLACED', 'PWD_PLACED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'REPORTED_PLACED' &&
                                                    entry.sub_indicator === type &&
                                                    !entry.sub_sub_indicator)
                                                .map(entry => entry.current_period)}
                                        </div>
                                        <div className="text-pink-600">
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'REPORTED_PLACED' &&
                                                    entry.sub_indicator === type &&
                                                    entry.sub_sub_indicator === 'FEMALE')
                                                .map(entry => entry.current_period)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>

                    {/* 10.7 PRAS assisted */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">10.7 PRAS assisted</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>10.7.1 Job applicants registered</div>
                                <div className="ml-4">10.7.1.1 Female</div>
                                <div>10.7.2 Job applicants placed</div>
                                <div className="ml-4">10.7.2.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['PRAS_REGISTERED', 'PRAS_PLACED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'PRAS_ASSISTED' &&
                                                    entry.sub_indicator === type &&
                                                    !entry.sub_sub_indicator)
                                                .map(entry => entry.previous_report_period)}
                                        </div>
                                        <div className="text-pink-600">
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'PRAS_ASSISTED' &&
                                                    entry.sub_indicator === type &&
                                                    entry.sub_sub_indicator === 'FEMALE')
                                                .map(entry => entry.previous_report_period)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['PRAS_REGISTERED', 'PRAS_PLACED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'PRAS_ASSISTED' &&
                                                    entry.sub_indicator === type &&
                                                    !entry.sub_sub_indicator)
                                                .map(entry => entry.current_period)}
                                        </div>
                                        <div className="text-pink-600">
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'PRAS_ASSISTED' &&
                                                    entry.sub_indicator === type &&
                                                    entry.sub_sub_indicator === 'FEMALE')
                                                .map(entry => entry.current_period)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>

                    {/* 10.8 Local Recruitment Activity (LRA) */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">10.8 Local Recruitment Activity (LRA)</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>10.8.1 LRA assisted</div>
                                <div className="ml-4">10.8.1.1 Local Government Units</div>
                                <div className="ml-4">10.8.2.1 Private Institutions</div>
                                <div className="ml-4">10.8.3.1 Schools</div>
                                <div>10.8.2 Job vacancies solicited</div>
                                <div>10.8.3 Job applicants registered</div>
                                <div className="ml-4">10.8.3.1 Female</div>
                                <div>10.8.4 Job applicants hired on the spot</div>
                                <div className="ml-4">10.8.4.1 Female</div>
                                <div>10.8.5 Job applicants reported placed</div>
                                <div className="ml-4">10.8.5.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {/* LRA Assisted */}
                                {['LRA_LGU', 'LRA_PRIVATE', 'LRA_SCHOOLS'].map((type) => (
                                    <div key={type}>
                                        {reportData[selectedReportIndex].entries
                                            .filter(entry => entry.program === 'JOB_FAIR' &&
                                                entry.indicator === 'LRA' &&
                                                entry.sub_indicator === 'LRA_ASSISTED' &&
                                                entry.sub_sub_indicator === type)
                                            .map(entry => entry.previous_report_period)}
                                    </div>
                                ))}
                                {/* Other LRA metrics */}
                                {['LRA_VACANCIES', 'LRA_APPLICANTS', 'LRA_HIRED', 'LRA_PLACED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'LRA' &&
                                                    entry.sub_indicator === type &&
                                                    !entry.sub_sub_indicator)
                                                .map(entry => entry.previous_report_period)}
                                        </div>
                                        {type !== 'LRA_VACANCIES' && (
                                            <div className="text-pink-600">
                                                {reportData[selectedReportIndex].entries
                                                    .filter(entry => entry.program === 'JOB_FAIR' &&
                                                        entry.indicator === 'LRA' &&
                                                        entry.sub_indicator === type &&
                                                        entry.sub_sub_indicator === 'FEMALE')
                                                    .map(entry => entry.previous_report_period)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {/* LRA Assisted */}
                                {['LRA_LGU', 'LRA_PRIVATE', 'LRA_SCHOOLS'].map((type) => (
                                    <div key={type}>
                                        {reportData[selectedReportIndex].entries
                                            .filter(entry => entry.program === 'JOB_FAIR' &&
                                                entry.indicator === 'LRA' &&
                                                entry.sub_indicator === 'LRA_ASSISTED' &&
                                                entry.sub_sub_indicator === type)
                                            .map(entry => entry.current_period)}
                                    </div>
                                ))}
                                {/* Other LRA metrics */}
                                {['LRA_VACANCIES', 'LRA_APPLICANTS', 'LRA_HIRED', 'LRA_PLACED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {reportData[selectedReportIndex].entries
                                                .filter(entry => entry.program === 'JOB_FAIR' &&
                                                    entry.indicator === 'LRA' &&
                                                    entry.sub_indicator === type &&
                                                    !entry.sub_sub_indicator)
                                                .map(entry => entry.current_period)}
                                        </div>
                                        {type !== 'LRA_VACANCIES' && (
                                            <div className="text-pink-600">
                                                {reportData[selectedReportIndex].entries
                                                    .filter(entry => entry.program === 'JOB_FAIR' &&
                                                        entry.indicator === 'LRA' &&
                                                        entry.sub_indicator === type &&
                                                        entry.sub_sub_indicator === 'FEMALE')
                                                    .map(entry => entry.current_period)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
} 