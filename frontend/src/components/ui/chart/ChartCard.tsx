import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface ChartCardProps {
  internalLinks: number;
  externalLinks: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({ internalLinks, externalLinks }) => {
  const barData = {
    labels: ["Internal Links", "External Links"],
    datasets: [
      {
        label: "Links",
        data: [internalLinks, externalLinks],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Internal vs. External Links" },
    },
    scales: {
      y: { beginAtZero: true, precision: 0 },
    },
  };

  return (
    <div className="w-full max-w-md md:max-w-lg bg-gray-50 rounded-xl shadow p-6 h-full min-h-[350px] flex items-center justify-center">
      <Bar data={barData} options={barOptions} />
    </div>
  );
};
