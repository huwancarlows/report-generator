"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import html2canvas from 'html2canvas';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser || !["admin", "user"].includes(storedUser.role)) {
      router.replace("/login");
    } else {
      setUser(storedUser);
    }
  }, [router]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (dashboardRef.current) {
        // Create a clone of the dashboard
        const clone = dashboardRef.current.cloneNode(true) as HTMLElement;
        
        // Remove dark mode classes
        clone.classList.remove('dark');
        clone.querySelectorAll('.dark\\:bg-gray-900').forEach(el => {
          el.classList.remove('dark:bg-gray-900');
          el.classList.add('bg-white');
        });
        clone.querySelectorAll('.dark\\:bg-gray-800').forEach(el => {
          el.classList.remove('dark:bg-gray-800');
          el.classList.add('bg-gray-100');
        });
        clone.querySelectorAll('.dark\\:text-white').forEach(el => {
          el.classList.remove('dark:text-white');
          el.classList.add('text-gray-900');
        });
        clone.querySelectorAll('.dark\\:text-blue-400').forEach(el => {
          el.classList.remove('dark:text-blue-400');
          el.classList.add('text-blue-600');
        });

        // Append clone to body (temporarily)
        document.body.appendChild(clone);
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';

        // Capture the clone
        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        // Remove the clone
        document.body.removeChild(clone);

        // Create download link
        const link = document.createElement('a');
        link.download = 'dashboard-report.png';
        link.href = canvas.toDataURL('image/png');
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
  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Performance',
      data: [65, 59, 80, 81, 56, 55],
      backgroundColor: 'rgb(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1,
    }]
  };

  const genderData = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: [60, 40],
      backgroundColor: ['rgb(59, 130, 246, 0.5)', 'rgb(239, 68, 68, 0.5)'],
      borderColor: ['rgb(59, 130, 246)', 'rgb(239, 68, 68)'],
      borderWidth: 1,
    }]
  };

  const educationData = {
    labels: ['High School', 'College', 'Vocational', 'Post-Grad'],
    datasets: [{
      data: [30, 45, 15, 10],
      backgroundColor: [
        'rgb(239, 68, 68, 0.5)',
        'rgb(59, 130, 246, 0.5)',
        'rgb(234, 179, 8, 0.5)',
        'rgb(20, 184, 166, 0.5)',
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(59, 130, 246)',
        'rgb(234, 179, 8)',
        'rgb(20, 184, 166)',
      ],
      borderWidth: 1,
    }]
  };

  const sectorData = {
    labels: ['Private', 'Government'],
    datasets: [{
      data: [70, 30],
      backgroundColor: ['rgb(20, 184, 166, 0.5)', 'rgb(124, 58, 237, 0.5)'],
      borderColor: ['rgb(20, 184, 166)', 'rgb(124, 58, 237)'],
      borderWidth: 1,
    }]
  };

  return (
    <div ref={dashboardRef} className="p-6 space-y-8 min-h-screen bg-gray-50 dark:bg-neutral-900 text-gray-800 dark:text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employment Dashboard</h1>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isExporting ? 'Exporting...' : 'Export Dashboard'}
        </button>
      </div>

      {/* Cumulative Performance */}
      <section className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Cumulative Performance of the 26 PESO</h2>
        <div className="h-60">
          <Bar
            data={performanceData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                  labels: {
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#1f2937'
                  }
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#1f2937'
                  },
                  grid: {
                    color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                  }
                },
                y: {
                  ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#1f2937'
                  },
                  grid: {
                    color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                  }
                }
              }
            }}
          />
        </div>
      </section>

      {/* Key Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["Solicited", "Registered", "Referred", "Placed"].map((metric) => (
          <div key={metric} className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow text-center">
            <h3 className="text-md font-medium">{metric}</h3>
            <p className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">0</p>
          </div>
        ))}
      </section>

      {/* Gender Distribution */}
      <section className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Gender of Registered Applicants</h2>
        <div className="h-60">
          <Pie
            data={genderData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right' as const,
                  labels: {
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#1f2937'
                  }
                },
              },
            }}
          />
        </div>
      </section>

      {/* Educational Attainment */}
      <section className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Applicants by Educational Attainment</h2>
        <div className="h-60">
          <Pie
            data={educationData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right' as const,
                  labels: {
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#1f2937'
                  }
                },
              },
            }}
          />
        </div>
      </section>

      {/* Placement in Private vs Government */}
      <section className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Placed Applicants (Private vs Government)</h2>
        <div className="h-60">
          <Pie
            data={sectorData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right' as const,
                  labels: {
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#1f2937'
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

