"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line, Chart } from 'react-chartjs-2';
import { exportToImage } from '@/utils/exportUtils';
import { getDashboardData } from '@/data/mockDashboardData';
import type { Metadata } from "next";

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

const GenderDistributionChart = ({ monthlyGenderData, selectedMonth }: { monthlyGenderData: Array<{ male: number, female: number }>, selectedMonth: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on container
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get current month's data
    const monthIndex = selectedMonth === 'all' ? 0 : parseInt(selectedMonth);
    const currentData = monthlyGenderData[monthIndex];
    const malePercentage = currentData.male;
    const femalePercentage = currentData.female;

    // Calculate total figures based on percentages (1 figure = 10%)
    const totalFigures = 10;
    const femaleFigures = Math.round((femalePercentage / 100) * totalFigures);
    const maleFigures = totalFigures - femaleFigures;

    // Enhanced colors with gradients
    const femaleGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    femaleGradient.addColorStop(0, '#EC4899');
    femaleGradient.addColorStop(1, '#DB2777');

    const maleGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    maleGradient.addColorStop(0, '#3B82F6');
    maleGradient.addColorStop(1, '#2563EB');

    // Set up dimensions with improved spacing
    const iconWidth = Math.min(40, canvas.width / (totalFigures * 1.5));
    const iconHeight = iconWidth * 2; // Taller figures for better visibility
    const spacing = iconWidth * 0.4; // Increased spacing between figures
    const startX = (canvas.width - (totalFigures * (iconWidth + spacing) - spacing)) / 2;
    const startY = canvas.height / 2 - iconHeight / 2 - 20; // Moved up to accommodate labels

    // Draw female figures first with shadow
    ctx.fillStyle = femaleGradient;
    ctx.shadowColor = 'rgba(236, 72, 153, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;

    for (let i = 0; i < femaleFigures; i++) {
      const x = startX + i * (iconWidth + spacing);

      // Head with smoother circle
      ctx.beginPath();
      ctx.arc(x + iconWidth / 2, startY + iconWidth / 3, iconWidth / 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Triangle dress body with curved bottom
      ctx.beginPath();
      ctx.moveTo(x + iconWidth / 2, startY + iconWidth / 2);
      ctx.lineTo(x + iconWidth / 8, startY + iconHeight);
      ctx.quadraticCurveTo(x + iconWidth / 2, startY + iconHeight + 5, x + iconWidth - iconWidth / 8, startY + iconHeight);
      ctx.closePath();
      ctx.fill();
    }

    // Reset shadow for male figures
    ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
    ctx.fillStyle = maleGradient;

    for (let i = 0; i < maleFigures; i++) {
      const x = startX + (i + femaleFigures) * (iconWidth + spacing);

      // Head
      ctx.beginPath();
      ctx.arc(x + iconWidth / 2, startY + iconWidth / 3, iconWidth / 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Rectangle body with rounded corners
      const bodyWidth = iconWidth / 2;
      const bodyHeight = iconHeight - iconWidth / 2;
      const radius = bodyWidth / 4;

      ctx.beginPath();
      ctx.moveTo(x + iconWidth / 2 - bodyWidth / 2 + radius, startY + iconWidth / 2);
      ctx.lineTo(x + iconWidth / 2 + bodyWidth / 2 - radius, startY + iconWidth / 2);
      ctx.quadraticCurveTo(x + iconWidth / 2 + bodyWidth / 2, startY + iconWidth / 2, x + iconWidth / 2 + bodyWidth / 2, startY + iconWidth / 2 + radius);
      ctx.lineTo(x + iconWidth / 2 + bodyWidth / 2, startY + iconWidth / 2 + bodyHeight - radius);
      ctx.quadraticCurveTo(x + iconWidth / 2 + bodyWidth / 2, startY + iconWidth / 2 + bodyHeight, x + iconWidth / 2 + bodyWidth / 2 - radius, startY + iconWidth / 2 + bodyHeight);
      ctx.lineTo(x + iconWidth / 2 - bodyWidth / 2 + radius, startY + iconWidth / 2 + bodyHeight);
      ctx.quadraticCurveTo(x + iconWidth / 2 - bodyWidth / 2, startY + iconWidth / 2 + bodyHeight, x + iconWidth / 2 - bodyWidth / 2, startY + iconWidth / 2 + bodyHeight - radius);
      ctx.lineTo(x + iconWidth / 2 - bodyWidth / 2, startY + iconWidth / 2 + radius);
      ctx.quadraticCurveTo(x + iconWidth / 2 - bodyWidth / 2, startY + iconWidth / 2, x + iconWidth / 2 - bodyWidth / 2 + radius, startY + iconWidth / 2);
      ctx.fill();
    }

    // Reset shadow for text
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Add labels with enhanced styling
    ctx.textAlign = 'center';

    // Female label with enhanced styling
    const drawLabel = (count: number, label: string, percentage: number, x: number, color: string) => {
      // Background pill
      const labelWidth = 120;
      const labelHeight = 80;
      const labelY = startY + iconHeight + 30;

      ctx.fillStyle = '#F8FAFC'; // Slight gray background
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      // Rounded rectangle background
      ctx.beginPath();
      ctx.roundRect(x - labelWidth / 2, labelY, labelWidth, labelHeight, 12);
      ctx.fill();
      ctx.stroke();

      // Count
      ctx.fillStyle = color;
      ctx.font = 'bold 24px Inter';
      ctx.fillText(count.toString(), x, labelY + 30);

      // Label
      ctx.font = '16px Inter';
      ctx.fillText(label, x, labelY + 50);

      // Percentage
      ctx.font = '14px Inter';
      ctx.fillText(`${percentage}%`, x, labelY + 70);
    };

    // Draw female label
    drawLabel(
      femaleFigures,
      'FEMALE',
      femalePercentage,
      startX + (femaleFigures * (iconWidth + spacing)) / 2,
      '#EC4899'
    );

    // Draw male label
    drawLabel(
      maleFigures,
      'MALE',
      malePercentage,
      startX + (femaleFigures * (iconWidth + spacing)) + (maleFigures * (iconWidth + spacing)) / 2,
      '#3B82F6'
    );

  }, [monthlyGenderData, selectedMonth]);

  useEffect(() => {
    drawChart();
    const handleResize = () => {
      drawChart();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawChart]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '800px'
        }}
      />
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('all');
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
    if (user) {
      // Get data based on user role
      const rawData = getDashboardData(selectedPeriod);

      if (user.role === 'user') {
        // Filter data for specific user
        let filteredData = {
          ...rawData,
          monthlyData: {
            ...rawData.monthlyData,
            datasets: rawData.monthlyData.datasets.map(dataset => ({
              ...dataset,
              data: dataset.data.map(value =>
                Math.round(value * (user.id % 3 === 0 ? 0.15 : user.id % 2 === 0 ? 0.12 : 0.10))
              )
            }))
          },
          topJobsData: {
            ...rawData.topJobsData,
            datasets: [{
              ...rawData.topJobsData.datasets[0],
              data: rawData.topJobsData.datasets[0].data.map(value =>
                Math.round(value * (user.id % 3 === 0 ? 0.15 : user.id % 2 === 0 ? 0.12 : 0.10))
              )
            }]
          },
          genderData: {
            ...rawData.genderData,
            datasets: [{
              ...rawData.genderData.datasets[0],
              data: selectedMonth === 'all'
                ? rawData.genderData.datasets[0].data
                : [rawData.monthlyGenderData[parseInt(selectedMonth)].male, rawData.monthlyGenderData[parseInt(selectedMonth)].female]
            }]
          },
          monthlyGenderData: rawData.monthlyGenderData,
          educationData: {
            ...rawData.educationData,
            datasets: [{
              ...rawData.educationData.datasets[0],
              data: rawData.educationData.datasets[0].data
            }]
          },
          sectorData: {
            ...rawData.sectorData,
            datasets: [{
              ...rawData.sectorData.datasets[0],
              data: rawData.sectorData.datasets[0].data
            }]
          },
          quickStats: {
            solicitedVacancies: {
              value: Math.round(rawData.quickStats.solicitedVacancies.value * 0.12),
              change: rawData.quickStats.solicitedVacancies.change
            },
            registeredApplicants: {
              value: Math.round(rawData.quickStats.registeredApplicants.value * 0.12),
              change: rawData.quickStats.registeredApplicants.change
            },
            referredApplicants: {
              value: Math.round(rawData.quickStats.referredApplicants.value * 0.12),
              change: rawData.quickStats.referredApplicants.change
            },
            placedApplicants: {
              value: Math.round(rawData.quickStats.placedApplicants.value * 0.12),
              change: rawData.quickStats.placedApplicants.change
            }
          }
        };

        // Filter by month if a specific month is selected
        if (selectedMonth !== 'all') {
          const monthIndex = parseInt(selectedMonth);
          filteredData = {
            ...filteredData,
            monthlyData: {
              ...filteredData.monthlyData,
              labels: [filteredData.monthlyData.labels[monthIndex]],
              datasets: filteredData.monthlyData.datasets.map(dataset => ({
                ...dataset,
                data: [dataset.data[monthIndex]]
              }))
            },
            quickStats: {
              solicitedVacancies: {
                value: Math.round(filteredData.monthlyData.datasets[0].data[monthIndex]),
                change: filteredData.quickStats.solicitedVacancies.change
              },
              registeredApplicants: {
                value: Math.round(filteredData.monthlyData.datasets[1].data[monthIndex]),
                change: filteredData.quickStats.registeredApplicants.change
              },
              referredApplicants: {
                value: Math.round(filteredData.monthlyData.datasets[2].data[monthIndex]),
                change: filteredData.quickStats.referredApplicants.change
              },
              placedApplicants: {
                value: Math.round(filteredData.monthlyData.datasets[3].data[monthIndex]),
                change: filteredData.quickStats.placedApplicants.change
              }
            }
          };
        }

        setDashboardData(filteredData);
      } else {
        // Admin sees all data
        let adminData = { ...rawData };

        // Filter by month if a specific month is selected
        if (selectedMonth !== 'all') {
          const monthIndex = parseInt(selectedMonth);
          adminData = {
            ...adminData,
            monthlyData: {
              ...adminData.monthlyData,
              labels: [adminData.monthlyData.labels[monthIndex]],
              datasets: adminData.monthlyData.datasets.map(dataset => ({
                ...dataset,
                data: [dataset.data[monthIndex]]
              }))
            },
            genderData: {
              ...adminData.genderData,
              datasets: [{
                ...adminData.genderData.datasets[0],
                data: [adminData.monthlyGenderData[monthIndex].male, adminData.monthlyGenderData[monthIndex].female]
              }]
            },
            quickStats: {
              solicitedVacancies: {
                value: Math.round(adminData.monthlyData.datasets[0].data[monthIndex]),
                change: adminData.quickStats.solicitedVacancies.change
              },
              registeredApplicants: {
                value: Math.round(adminData.monthlyData.datasets[1].data[monthIndex]),
                change: adminData.quickStats.registeredApplicants.change
              },
              referredApplicants: {
                value: Math.round(adminData.monthlyData.datasets[2].data[monthIndex]),
                change: adminData.quickStats.referredApplicants.change
              },
              placedApplicants: {
                value: Math.round(adminData.monthlyData.datasets[3].data[monthIndex]),
                change: adminData.quickStats.placedApplicants.change
              }
            }
          };
        }
        setDashboardData(adminData);
      }
    }
  }, [selectedPeriod, selectedMonth, user]);

  const handleExportDashboard = async () => {
    setIsExporting(true);
    try {
      if (dashboardRef.current) {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `DOLE-Dashboard-${selectedPeriod}-${selectedMonth}-${timestamp}.png`;

        await exportToImage(dashboardRef.current, filename, {
          windowWidth: dashboardRef.current.scrollWidth,
          windowHeight: dashboardRef.current.scrollHeight,
          backgroundColor: '#f9fafb',
          delay: 500 // Wait for charts to render
        });
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
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `DOLE-${chartName}-${selectedPeriod}-${selectedMonth}-${timestamp}.png`;

        await exportToImage(chartRef.current, filename, {
          backgroundColor: '#ffffff',
          delay: 300 // Wait for chart to render
        });
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
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
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
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        beginAtZero: true,
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: 500
          },
        },
      },
    },
    plugins: {
      ...commonChartOptions.plugins,
      tooltip: {
        ...commonChartOptions.plugins.tooltip,
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    barPercentage: 0.8,
    categoryPercentage: 0.9,
    borderRadius: 4,
    borderWidth: 0
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
      }
    },
  };

  const genderChartOptions = {
    ...pieChartOptions,
    plugins: {
      ...pieChartOptions.plugins,
      legend: {
        ...pieChartOptions.plugins.legend,
        labels: {
          ...commonChartOptions.plugins.legend.labels,
          generateLabels: function (chart: any) {
            const originalLabels = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
            return originalLabels.map((label: any, index: number) => {
              const icons = ['👨', '👩'];  // Using emojis for better compatibility
              return {
                ...label,
                text: `${icons[index]} ${label.text}`
              };
            });
          }
        }
      },
      tooltip: {
        ...pieChartOptions.plugins.tooltip,
        callbacks: {
          label: function (context: any) {
            const icons = ['👨', '👩'];
            const label = context.label;
            const value = context.formattedValue;
            return `${icons[context.dataIndex]} ${label}: ${value}%`;
          }
        }
      }
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Enhanced Dashboard Header */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </span>
                {user.role === 'admin' ? 'PESO Employment Analytics' : `${user.address} Employment Report`}
              </h1>
              <p className="text-gray-600 ml-[60px]">
                {user.role === 'admin'
                  ? 'Comprehensive overview of employment statistics across 26 PESO LGUs'
                  : `Monthly performance metrics for ${user.name || 'Your Municipality'}`
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col min-w-[140px]">
                  <label htmlFor="month-select" className="text-sm font-medium text-gray-700 mb-1.5">Select Month</label>
                  <select
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="block w-full rounded-lg border-gray-200 bg-white px-4 py-2.5 text-gray-800 shadow-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm font-medium transition-colors duration-200"
                  >
                    <option value="all">All Months</option>
                    {['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                        <option key={month} value={index}>{month}</option>
                      ))}
                  </select>
                </div>

                <div className="flex flex-col min-w-[120px]">
                  <label htmlFor="year-select" className="text-sm font-medium text-gray-700 mb-1.5">Select Year</label>
                  <select
                    id="year-select"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="block w-full rounded-lg border-gray-200 bg-white px-4 py-2.5 text-gray-800 shadow-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm font-medium transition-colors duration-200"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleExportDashboard}
                disabled={isExporting}
                className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm ml-2"
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
                    Export Dashboard
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(dashboardData.quickStats).map(([key, stat], index) => {
            const icons = [
              <svg key="1" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>,
              <svg key="2" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>,
              <svg key="3" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>,
              <svg key="4" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            ];

            const bgGradients = [
              'from-blue-50 to-blue-100/50',
              'from-green-50 to-green-100/50',
              'from-yellow-50 to-yellow-100/50',
              'from-red-50 to-red-100/50'
            ];

            const iconColors = [
              'text-blue-600',
              'text-green-600',
              'text-yellow-600',
              'text-red-600'
            ];

            const borderColors = [
              'border-blue-100',
              'border-green-100',
              'border-yellow-100',
              'border-red-100'
            ];

            return (
              <div 
                key={key} 
                className={`bg-gradient-to-br ${bgGradients[index]} rounded-2xl p-6 shadow-lg border ${borderColors[index]} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="flex items-start">
                  <div className={`p-3 rounded-xl bg-white/80 backdrop-blur-sm ${iconColors[index]} shadow-sm`}>
                    {icons[index]}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-600 capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      {stat.value.toLocaleString()}
                    </p>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm ${
                      stat.change > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <svg 
                        className={`w-4 h-4 mr-1 ${stat.change > 0 ? 'rotate-0' : 'rotate-180'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {Math.abs(stat.change)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-8">
          {/* Monthly Performance Chart */}
          <section 
            ref={chartRefs.performance} 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </span>
                  Monthly PESO Performance
                </h2>
                <p className="text-sm text-gray-500 mt-2 ml-[52px]">
                  Track monthly employment facilitation progress
                </p>
              </div>
              <button
                onClick={() => handleExportChart('performance')}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-all duration-200"
              >
                {isExporting ? 'Exporting...' : 'Export Chart'}
              </button>
            </div>
            <div className="h-[400px] w-full">
              <Bar data={dashboardData.monthlyData} options={lineChartOptions} />
            </div>
          </section>

          {/* Top Available Jobs */}
          <section ref={chartRefs.jobs} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </span>
                  Top 10 Available Jobs
                </h2>
                <p className="text-sm text-gray-500 mt-2 ml-[52px]">
                  Most in-demand positions across all LGUs
                </p>
              </div>
              <button
                onClick={() => handleExportChart('jobs')}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-all duration-200"
              >
                {isExporting ? 'Exporting...' : 'Export Chart'}
              </button>
            </div>
            <div className="h-[400px] w-full">
              <Bar data={dashboardData.topJobsData} options={barChartOptions} />
            </div>
          </section>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gender Distribution */}
            <section ref={chartRefs.gender} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </span>
                    Gender Distribution
                  </h2>
                  <p className="text-sm text-gray-500 mt-2 ml-[52px]">
                    Gender of Registered Applicants
                  </p>
                </div>
                <button
                  onClick={() => handleExportChart('gender')}
                  disabled={isExporting}
                  className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-all duration-200"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
              <div className="h-[300px]">
                <GenderDistributionChart
                  monthlyGenderData={dashboardData.monthlyGenderData}
                  selectedMonth={selectedMonth}
                />
              </div>
            </section>

            {/* Educational Attainment */}
            <section ref={chartRefs.education} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </span>
                    Educational Background
                  </h2>
                  <p className="text-sm text-gray-500 mt-2 ml-[52px]">
                    Applicants by Educational Attainment
                  </p>
                </div>
                <button
                  onClick={() => handleExportChart('education')}
                  disabled={isExporting}
                  className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-all duration-200"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
              <div className="h-[300px]">
                <Pie data={dashboardData.educationData} options={pieChartOptions} />
              </div>
            </section>

            {/* Sector Distribution */}
            <section ref={chartRefs.sector} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </span>
                    Employment Sectors
                  </h2>
                  <p className="text-sm text-gray-500 mt-2 ml-[52px]">
                    Placed Applicants in Private vs Government Sector
                  </p>
                </div>
                <button
                  onClick={() => handleExportChart('sector')}
                  disabled={isExporting}
                  className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-all duration-200"
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
