"use client";

import React from "react";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-8 min-h-screen bg-gray-50 dark:bg-[#111] text-gray-800 dark:text-white">
      <h1 className="text-2xl font-bold">Employment Dashboard</h1>

      {/* Cumulative Performance */}
      <section className="bg-white dark:bg-[#1f1f1f] rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Cumulative Performance of the 26 PESO</h2>
        <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
          [Graph Placeholder: Cumulative Performance]
        </div>
      </section>

      {/* Employment Report per LGU */}
      <section className="bg-white dark:bg-[#1f1f1f] rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Employment Report per LGU (Per Month and Cumulative)</h2>
        <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
          [Graph Placeholder: Report per LGU]
        </div>
      </section>

      {/* Key Metrics: Solicited, Registered, Referred, Placed */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["Solicited", "Registered", "Referred", "Placed"].map((metric) => (
          <div key={metric} className="bg-white dark:bg-[#1f1f1f] p-4 rounded-lg shadow text-center">
            <h3 className="text-md font-medium">{metric}</h3>
            <p className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">0</p>
          </div>
        ))}
      </section>

      {/* Top 10 Available Jobs */}
      <section className="bg-white dark:bg-[#1f1f1f] rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Top 10 Available Jobs</h2>
        <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
          [Graph Placeholder: Top 10 Jobs]
        </div>
      </section>

      {/* Gender Distribution */}
      <section className="bg-white dark:bg-[#1f1f1f] rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Gender of Registered Applicants</h2>
        <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
          [Graph Placeholder: Gender]
        </div>
      </section>

      {/* Educational Attainment */}
      <section className="bg-white dark:bg-[#1f1f1f] rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Applicants by Educational Attainment</h2>
        <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
          [Graph Placeholder: Education]
        </div>
      </section>

      {/* Placement in Private vs Government */}
      <section className="bg-white dark:bg-[#1f1f1f] rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Placed Applicants (Private vs Government)</h2>
        <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
          [Graph Placeholder: Sector Placement]
        </div>
      </section>
    </div>
  );
}
