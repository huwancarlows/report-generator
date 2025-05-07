import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';

export default function DashboardExportContent({
    barRef,
    jobsRef,
    genderCanvasRef,
    educationRef,
    sectorRef,
    dashboardData,
    monthlyGroupData,
    lineChartOptions,
    barChartOptions,
    pieChartOptions,
    selectedMonth,
    monthGroup,
    user,
    GenderDistributionChart
}: any) {
    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            {/* Header and quick stats (copy from dashboard) */}
            {/* Monthly Performance Chart */}
            <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="h-[400px] w-full">
                    <Bar ref={barRef} data={monthlyGroupData} options={lineChartOptions} />
                </div>
            </section>
            {/* Top Available Jobs */}
            <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="h-[400px] w-full">
                    <Bar ref={jobsRef} data={dashboardData.topJobsData} options={barChartOptions} />
                </div>
            </section>
            {/* Gender Distribution */}
            <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="h-[300px]">
                    {(() => {
                        let genderData;
                        if (selectedMonth === 'all') {
                            const months = dashboardData.monthlyGenderData;
                            const totalMale = months.reduce((sum: number, m: any) => sum + m.male, 0);
                            const totalFemale = months.reduce((sum: number, m: any) => sum + m.female, 0);
                            const avgMale = Math.round(totalMale / months.length);
                            const avgFemale = Math.round(totalFemale / months.length);
                            genderData = { male: avgMale, female: avgFemale };
                        } else {
                            genderData = dashboardData.monthlyGenderData[parseInt(selectedMonth)] || { male: 0, female: 0 };
                        }
                        return (
                            <GenderDistributionChart
                                genderData={genderData}
                                totalApplicants={(() => {
                                    if (selectedMonth === 'all') {
                                        return dashboardData.monthlyData.datasets[1].data.reduce((a: number, b: number) => a + b, 0);
                                    } else {
                                        return dashboardData.monthlyData.datasets[1].data[parseInt(selectedMonth)] || 0;
                                    }
                                })()}
                                forceRedraw={Date.now()}
                            />
                        );
                    })()}
                </div>
            </section>
            {/* Educational Attainment */}
            <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="h-[300px]">
                    <Pie ref={educationRef} data={dashboardData.educationData} options={pieChartOptions} />
                </div>
            </section>
            {/* Sector Distribution */}
            <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="h-[300px]">
                    <Pie ref={sectorRef} data={dashboardData.sectorData} options={pieChartOptions} />
                </div>
            </section>
        </div>
    );
} 