"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { getDashboardData } from '@/data/mockDashboardData';

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

// Type definitions for chart options
type ChartFontSpec = {
  size: number;
  family: string;
  weight: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
};

interface CommonChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      position: 'top' | 'right';
      labels: {
        padding: number;
        font: ChartFontSpec;
        usePointStyle: boolean;
        pointStyle: 'circle';
      };
    };
    tooltip: {
      backgroundColor: string;
      titleFont: ChartFontSpec;
      bodyFont: ChartFontSpec;
      padding: number;
      cornerRadius: number;
    };
  };
}

// Add utility function for high-quality exports
const createHighQualityCanvas = async (element: HTMLElement, options = {}) => {
  // Calculate device pixel ratio
  const dpr = window.devicePixelRatio || 1;
  const scale = Math.max(dpr, 2); // Use at least 2x scaling for better quality

  // Default configuration for best quality
  const defaultOptions = {
    scale: scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    imageTimeout: 0,
    removeContainer: true,
    backgroundColor: '#ffffff',
    foreignObjectRendering: true, // Enable if browser supports it
    onclone: (clonedDoc: Document) => {
      const style = clonedDoc.createElement('style');
      style.innerHTML = `
        * { 
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        canvas { 
          max-width: none !important; 
          max-height: none !important;
        }
        .chart-container { 
          position: relative !important;
          break-inside: avoid;
          page-break-inside: avoid;
        }
      `;
      clonedDoc.head.appendChild(style);

      // Force charts to render at maximum quality
      const canvases = clonedDoc.getElementsByTagName('canvas');
      Array.from(canvases).forEach(canvas => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }
      });
    }
  };

  // Merge with custom options
  const finalOptions = { ...defaultOptions, ...options };

  try {
    // Create canvas with high DPI settings
    const canvas = await html2canvas(element, finalOptions);

    // Create a new canvas with the exact same dimensions
    const perfectCanvas = document.createElement('canvas');
    perfectCanvas.width = canvas.width;
    perfectCanvas.height = canvas.height;
    const ctx = perfectCanvas.getContext('2d');

    if (ctx) {
      // Apply high-quality rendering settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw the original canvas onto the new one
      ctx.drawImage(canvas, 0, 0);
    }

    return perfectCanvas;
  } catch (error) {
    console.error('Error creating high-quality canvas:', error);
    throw error;
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [dashboardData, setDashboardData] = useState(getDashboardData('2024'));
  const dashboardRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    setDashboardData(getDashboardData(selectedPeriod));
  }, [selectedPeriod]);

  const handleExportDashboard = async () => {
    setIsExporting(true);
    try {
      if (dashboardRef.current) {
        // Wait for all charts to finish rendering
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await createHighQualityCanvas(dashboardRef.current, {
          windowWidth: dashboardRef.current.scrollWidth,
          windowHeight: dashboardRef.current.scrollHeight,
          backgroundColor: '#f9fafb'
        });

        // Convert to high-quality PNG
        const dataUrl = canvas.toDataURL('image/png', 1.0);

        // Create download link with formatted filename
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `DOLE-Dashboard-${selectedPeriod}-${timestamp}.png`;

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Export error:', error);
      // You might want to add error handling UI here
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportChart = async (chartName: string) => {
    setIsExporting(true);
    try {
      const chartRef = chartRefs[chartName as keyof typeof chartRefs];
      if (chartRef.current) {
        // Wait for chart to finish rendering
        await new Promise(resolve => setTimeout(resolve, 300));

        const canvas = await createHighQualityCanvas(chartRef.current, {
          backgroundColor: '#ffffff'
        });

        // Convert to high-quality PNG
        const dataUrl = canvas.toDataURL('image/png', 1.0);

        // Create download link with formatted filename
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `DOLE-${chartName}-${selectedPeriod}-${timestamp}.png`;

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Export error:', error);
      // You might want to add error handling UI here
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) return null;

  const commonChartOptions: CommonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          font: {
            size: 13,
            family: "'Inter', sans-serif",
            weight: 500
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif",
          weight: 600
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
          weight: 400
        },
        padding: 12,
        cornerRadius: 8,
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
            family: "'Inter', sans-serif",
            weight: 500
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
            family: "'Inter', sans-serif",
            weight: 500
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
            family: "'Inter', sans-serif",
            weight: 500
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
            family: "'Inter', sans-serif",
            weight: 500
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 py-8" ref={dashboardRef}>
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PESO Employment Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">Cumulative Performance of 26 PESO Employment Report per LGU</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="block rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
            <button
              onClick={handleExportDashboard}
              disabled={isExporting}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting Dashboard...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Dashboard
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Solicited Vacancies</h3>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.quickStats.solicitedVacancies.value}</p>
                <p className="text-sm text-green-600">↑ {dashboardData.quickStats.solicitedVacancies.change}% vs last month</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Registered Applicants</h3>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.quickStats.registeredApplicants.value}</p>
                <p className="text-sm text-green-600">↑ {dashboardData.quickStats.registeredApplicants.change}% vs last month</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Referred Applicants</h3>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.quickStats.referredApplicants.value}</p>
                <p className="text-sm text-green-600">↑ {dashboardData.quickStats.referredApplicants.change}% vs last month</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Placed Applicants</h3>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.quickStats.placedApplicants.value}</p>
                <p className="text-sm text-green-600">↑ {dashboardData.quickStats.placedApplicants.change}% vs last month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Monthly Performance */}
          <section ref={chartRefs.performance} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Monthly PESO Performance</h2>
                <p className="text-sm text-gray-500 mt-1">Monthly and Cumulative Employment Report per LGU</p>
              </div>
              <button
                onClick={() => handleExportChart('performance')}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {isExporting ? 'Exporting...' : 'Export Chart'}
              </button>
            </div>
            <div className="h-[400px]">
              <Line data={dashboardData.monthlyData} options={lineChartOptions} />
            </div>
          </section>

          {/* Top Available Jobs */}
          <section ref={chartRefs.jobs} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Top 10 Available Jobs</h2>
                <p className="text-sm text-gray-500 mt-1">Most in-demand positions across all LGUs</p>
              </div>
              <button
                onClick={() => handleExportChart('jobs')}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {isExporting ? 'Exporting...' : 'Export Chart'}
              </button>
            </div>
            <div className="h-[400px]">
              <Bar data={dashboardData.topJobsData} options={barChartOptions} />
            </div>
          </section>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gender Distribution */}
            <section ref={chartRefs.gender} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Gender Distribution</h2>
                  <p className="text-sm text-gray-500 mt-1">Gender of Registered Applicants</p>
                </div>
                <button
                  onClick={() => handleExportChart('gender')}
                  disabled={isExporting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
              <div className="h-[300px]">
                <Pie data={dashboardData.genderData} options={pieChartOptions} />
              </div>
            </section>

            {/* Educational Attainment */}
            <section ref={chartRefs.education} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Educational Background</h2>
                  <p className="text-sm text-gray-500 mt-1">Applicants by Educational Attainment</p>
                </div>
                <button
                  onClick={() => handleExportChart('education')}
                  disabled={isExporting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
              <div className="h-[300px]">
                <Pie data={dashboardData.educationData} options={pieChartOptions} />
              </div>
            </section>

            {/* Sector Distribution */}
            <section ref={chartRefs.sector} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Employment Sectors</h2>
                  <p className="text-sm text-gray-500 mt-1">Placed Applicants in Private vs Government Sector</p>
                </div>
                <button
                  onClick={() => handleExportChart('sector')}
                  disabled={isExporting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
              <div className="h-[300px]">
                <Pie data={dashboardData.sectorData} options={pieChartOptions} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
