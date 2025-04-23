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
        document.body.appendChild(clone);
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.backgroundColor = '#ffffff';
        clone.style.padding = '20px';

        // Remove all Tailwind classes and set basic styles
        const elements = clone.querySelectorAll('*');
        elements.forEach(element => {
          const el = element as HTMLElement;
          el.className = ''; // Remove all classes
          el.style.backgroundColor = '#ffffff';
          el.style.color = '#000000';
          el.style.borderColor = '#000000';
        });

        // Ensure canvas is visible
        const canvas = clone.querySelector('canvas');
        if (canvas) {
          canvas.style.display = 'block';
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
        }

        const exportCanvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          foreignObjectRendering: true
        });

        document.body.removeChild(clone);

        const link = document.createElement('a');
        link.download = `${chartName}-report.png`;
        link.href = exportCanvas.toDataURL('image/png');
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

  return (
    <div className="p-6 space-y-8 min-h-screen bg-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Employment Dashboard</h1>
      </div>

      {/* Cumulative Performance */}
      <section ref={chartRefs.performance} className="bg-white rounded-lg p-6 shadow border border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">CUMULATIVE PERFORMANCE OF THE 26 PESO</h2>
          <button
            onClick={() => handleExport('performance')}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isExporting ? 'Exporting...' : 'Export Chart'}
          </button>
        </div>
        <div className="h-80">
          <Line
            data={monthlyData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    color: '#000000',
                    font: {
                      size: 12
                    }
                  }
                },
              },
              scales: {
                x: {
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                  },
                  ticks: {
                    color: '#000000'
                  }
                },
                y: {
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                  },
                  ticks: {
                    color: '#000000'
                  }
                }
              }
            }}
          />
        </div>
      </section>

      {/* Top 10 Available Jobs */}
      <section ref={chartRefs.jobs} className="bg-white rounded-lg p-6 shadow border border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Top 10 Available Jobs</h2>
          <button
            onClick={() => handleExport('jobs')}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isExporting ? 'Exporting...' : 'Export Chart'}
          </button>
        </div>
        <div className="h-80">
          <Bar
            data={topJobsData}
            options={{
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
              },
              scales: {
                x: {
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                  },
                  ticks: {
                    color: '#000000'
                  }
                },
                y: {
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                  },
                  ticks: {
                    color: '#000000'
                  }
                }
              }
            }}
          />
        </div>
      </section>

      {/* Gender Distribution */}
      <section ref={chartRefs.gender} className="bg-white rounded-lg p-6 shadow border border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Gender of Registered Applicants</h2>
          <button
            onClick={() => handleExport('gender')}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isExporting ? 'Exporting...' : 'Export Chart'}
          </button>
        </div>
        <div className="h-80">
          <Pie
            data={genderData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    color: '#000000',
                    font: {
                      size: 12
                    }
                  }
                },
              },
            }}
          />
        </div>
      </section>

      {/* Educational Attainment */}
      <section ref={chartRefs.education} className="bg-white rounded-lg p-6 shadow border border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Applicants by Educational Attainment</h2>
          <button
            onClick={() => handleExport('education')}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isExporting ? 'Exporting...' : 'Export Chart'}
          </button>
        </div>
        <div className="h-80">
          <Pie
            data={educationData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    color: '#000000',
                    font: {
                      size: 12
                    }
                  }
                },
              },
            }}
          />
        </div>
      </section>

      {/* Placement in Private vs Government */}
      <section ref={chartRefs.sector} className="bg-white rounded-lg p-6 shadow border border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Placed Applicants in Private vs Government Sector</h2>
          <button
            onClick={() => handleExport('sector')}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isExporting ? 'Exporting...' : 'Export Chart'}
          </button>
        </div>
        <div className="h-80">
          <Pie
            data={sectorData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    color: '#000000',
                    font: {
                      size: 12
                    }
                  }
                },
              },
            }}
          />
        </div>
      </section>
    </div>
  );
}
