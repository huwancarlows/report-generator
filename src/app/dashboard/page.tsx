"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const chartRefs = {
    performance: useRef<HTMLDivElement>(null),
    jobs: useRef<HTMLDivElement>(null),
    gender: useRef<HTMLDivElement>(null),
    education: useRef<HTMLDivElement>(null),
    sector: useRef<HTMLDivElement>(null)
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser || !["admin", "user"].includes(storedUser.role)) {
      router.replace("/login");
    } else {
      setUser(storedUser);
    }
  }, [router]);

  const handleExport = async (chartName: string) => {
    setIsExporting(true);
    try {
      const chartRef = chartRefs[chartName as keyof typeof chartRefs];
      if (chartRef.current) {
        const clone = chartRef.current.cloneNode(true) as HTMLElement;

        // Set up the clone for export
        clone.style.position = 'fixed';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.width = '1200px'; // Fixed width for consistent exports
        clone.style.backgroundColor = '#ffffff';
        clone.style.padding = '32px';
        clone.style.borderRadius = '0';
        clone.style.border = 'none';
        document.body.appendChild(clone);

        // Style adjustments for export
        const title = clone.querySelector('h2');
        if (title) {
          title.style.fontSize = '24px';
          title.style.marginBottom = '24px';
          title.style.color = '#111827';
        }

        const canvas = clone.querySelector('canvas');
        if (canvas) {
          canvas.style.width = '100%';
          canvas.style.height = '500px'; // Fixed height for consistent exports
        }

        // Remove export button from clone
        const exportButton = clone.querySelector('button');
        if (exportButton) {
          exportButton.remove();
        }

        const exportCanvas = await html2canvas(clone, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          width: 1200,
          height: 600,
        });

        document.body.removeChild(clone);

        const link = document.createElement('a');
        link.download = `${chartName}-report-${new Date().toISOString().split('T')[0]}.png`;
        link.href = exportCanvas.toDataURL('image/png', 1.0);
        link.click();
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) return null;

  // Sample data - replace with real data from your backend
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Solicited',
        data: [120, 150, 180, 200, 220, 250],
        borderColor: '#0000ff',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#0000ff',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'Registered',
        data: [100, 130, 160, 180, 200, 230],
        borderColor: '#008000',
        backgroundColor: 'rgba(0, 128, 0, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#008000',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'Referred',
        data: [80, 110, 140, 160, 180, 210],
        borderColor: '#ffa500',
        backgroundColor: 'rgba(255, 165, 0, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#ffa500',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'Placed',
        data: [60, 90, 120, 140, 160, 190],
        borderColor: '#ff0000',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#ff0000',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      }
    ]
  };

  const topJobsData = {
    labels: ['Customer Service', 'Sales Associate', 'Admin Staff', 'IT Support', 'Accountant', 'Teacher', 'Nurse', 'Driver', 'Security Guard', 'Factory Worker'],
    datasets: [{
      label: 'Available Positions',
      data: [50, 45, 40, 35, 30, 25, 20, 15, 10, 5],
      backgroundColor: '#0000ff',
      borderColor: '#0000cc',
      borderWidth: 1,
    }]
  };

  const genderData = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: [60, 40],
      backgroundColor: ['#0000ff', '#ff0000'],
      borderColor: ['#0000cc', '#cc0000'],
      borderWidth: 1,
    }]
  };

  const educationData = {
    labels: ['High School', 'College', 'Vocational', 'Post-Grad'],
    datasets: [{
      data: [30, 45, 15, 10],
      backgroundColor: ['#0000ff', '#008000', '#ffa500', '#800080'],
      borderColor: ['#0000cc', '#006400', '#cc8400', '#660066'],
      borderWidth: 1,
    }]
  };

  const sectorData = {
    labels: ['Private', 'Government'],
    datasets: [{
      data: [70, 30],
      backgroundColor: ['#0000ff', '#008000'],
      borderColor: ['#0000cc', '#006400'],
      borderWidth: 1,
    }]
  };

  // Update chart options for better visualization
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
    },
  };

  const lineChartOptions = {
    ...commonChartOptions,
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
    },
  };

  const barChartOptions = {
    ...commonChartOptions,
    indexAxis: 'y' as const,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
    },
  };

  const pieChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      legend: {
        ...commonChartOptions.plugins.legend,
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DOLE Employment Dashboard</h1>
          <p className="mt-2 text-gray-600">Comprehensive overview of employment statistics and trends</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Cumulative Performance */}
          <section ref={chartRefs.performance} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">CUMULATIVE PERFORMANCE OF THE 26 PESO</h2>
              <button
                onClick={() => handleExport('performance')}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Chart
                  </>
                )}
              </button>
            </div>
            <div className="h-[400px]">
              <Line data={monthlyData} options={lineChartOptions} />
            </div>
          </section>

          {/* Top 10 Available Jobs */}
          <section ref={chartRefs.jobs} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Top 10 Available Jobs</h2>
              <button
                onClick={() => handleExport('jobs')}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Chart
                  </>
                )}
              </button>
            </div>
            <div className="h-[400px]">
              <Bar data={topJobsData} options={barChartOptions} />
            </div>
          </section>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gender Distribution */}
            <section ref={chartRefs.gender} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Gender Distribution</h2>
                <button
                  onClick={() => handleExport('gender')}
                  disabled={isExporting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {isExporting ? 'Exporting...' : 'Export Chart'}
                </button>
              </div>
              <div className="h-[300px]">
                <Pie data={genderData} options={pieChartOptions} />
              </div>
            </section>

            {/* Educational Attainment */}
            <section ref={chartRefs.education} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Educational Attainment</h2>
                <button
                  onClick={() => handleExport('education')}
                  disabled={isExporting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {isExporting ? 'Exporting...' : 'Export Chart'}
                </button>
              </div>
              <div className="h-[300px]">
                <Pie data={educationData} options={pieChartOptions} />
              </div>
            </section>

            {/* Sector Distribution */}
            <section ref={chartRefs.sector} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Sector Distribution</h2>
                <button
                  onClick={() => handleExport('sector')}
                  disabled={isExporting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {isExporting ? 'Exporting...' : 'Export Chart'}
                </button>
              </div>
              <div className="h-[300px]">
                <Pie data={sectorData} options={pieChartOptions} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
