import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Cell } from "recharts";

interface LogChartProps {
  errorCount: number;
  warningCount?: number;
  infoCount?: number;
}

const LogChart: React.FC<LogChartProps> = ({
  errorCount,
  warningCount = 0,
  infoCount = 0,
}) => {
  const data = [
    { name: "Errors", value: errorCount, color: "#ef4444" },
    { name: "Warnings", value: warningCount, color: "#f59e42" },
    { name: "Info", value: infoCount, color: "#2563eb" },
  ];

  return (
    <div className="w-full h-40 mt-5 rounded-lg bg-blue-50 p-4 flex items-center shadow-md">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" radius={8} label={{ position: "top" }} isAnimationActive>
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default LogChart;
