import { useMemo, useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  FaChartBar,
  FaChartLine,
  FaChartPie,
} from "react-icons/fa";
import "./Analytics.css";

/* =========================
   CONSTANTS
========================= */
const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

/* =========================
   COMPONENT
========================= */
const EventAnalytics = ({ events = [], registrations = [] }) => {
  const [chartType, setChartType] = useState("revenue");
  const [timeRange, setTimeRange] = useState("month");

  /* =========================
     DATA PROCESSING (MOCK)
     → Replace with real logic later
  ========================= */
  const chartData = useMemo(() => {
    const baseOptions = {
      labels: MONTHS,
    };

    switch (chartType) {
      case "attendance":
        return {
          ...baseOptions,
          datasets: [
            {
              label: "Attendance",
              data: [120,150,180,210,190,240,280,320,290,350,380,420],
              backgroundColor: "rgba(33,150,243,0.6)",
              borderColor: "#2196f3",
              borderWidth: 2,
            },
          ],
        };

      case "categories":
        return {
          labels: ["Music","Technology","Business","Sports","Arts","Food","Education"],
          datasets: [
            {
              data: [35,25,15,10,8,5,2],
              backgroundColor: [
                "#4caf50","#2196f3","#ff9800",
                "#f44336","#9c27b0","#ffeb3b","#795548",
              ],
            },
          ],
        };

      case "growth":
        return {
          ...baseOptions,
          datasets: [
            {
              label: "New Users",
              data: [50,60,70,85,95,110,125,140,155,170,190,210],
              borderColor: "#4caf50",
              backgroundColor: "rgba(76,175,80,0.1)",
              fill: true,
            },
            {
              label: "Registrations",
              data: [70,85,100,120,140,160,190,220,250,280,310,350],
              borderColor: "#2196f3",
              backgroundColor: "rgba(33,150,243,0.1)",
              fill: true,
            },
          ],
        };

      case "revenue":
      default:
        return {
          ...baseOptions,
          datasets: [
            {
              label: "Revenue",
              data: [4500,5200,6800,5900,6000,7200,8500,9200,8700,9500,10200,11500],
              backgroundColor: "rgba(76,175,80,0.6)",
              borderColor: "#4caf50",
              borderWidth: 2,
            },
          ],
        };
    }
  }, [chartType]);

  /* =========================
     CHART OPTIONS
  ========================= */
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: getChartTitle(chartType),
        font: { size: 16 },
      },
    },
  }), [chartType]);

  /* =========================
     RENDER CHART
  ========================= */
  const renderChart = () => {
    if (chartType === "categories") {
      return <Doughnut data={chartData} options={chartOptions} />;
    }

    if (chartType === "growth") {
      return <Line data={chartData} options={chartOptions} />;
    }

    return <Bar data={chartData} options={chartOptions} />;
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Event Analytics</h2>

        <div className="analytics-controls">
          <div className="chart-type-selector">
            <ChartButton
              active={chartType === "revenue"}
              onClick={() => setChartType("revenue")}
              icon={<FaChartBar />}
              label="Revenue"
            />
            <ChartButton
              active={chartType === "attendance"}
              onClick={() => setChartType("attendance")}
              icon={<FaChartBar />}
              label="Attendance"
            />
            <ChartButton
              active={chartType === "categories"}
              onClick={() => setChartType("categories")}
              icon={<FaChartPie />}
              label="Categories"
            />
            <ChartButton
              active={chartType === "growth"}
              onClick={() => setChartType("growth")}
              icon={<FaChartLine />}
              label="Growth"
            />
          </div>

          <div className="time-range-selector">
            {["week","month","year"].map((range) => (
              <button
                key={range}
                className={timeRange === range ? "active" : ""}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="analytics-chart">
        {renderChart()}
      </div>

      {/* SUMMARY */}
      <div className="analytics-summary">
        <SummaryCard title="Total Revenue" value="$85,700" change="+12.5%" />
        <SummaryCard title="Total Attendance" value="2,530" change="+8.3%" />
        <SummaryCard title="Conversion Rate" value="68.4%" change="+5.2%" />
        <SummaryCard title="Avg. Ticket Price" value="$42.50" change="-2.1%" negative />
      </div>
    </div>
  );
};

/* =========================
   HELPERS
========================= */
const getChartTitle = (type) => ({
  revenue: "Monthly Revenue",
  attendance: "Event Attendance",
  categories: "Event Categories Distribution",
  growth: "Growth Trends",
}[type] || "Event Analytics");

const ChartButton = ({ active, onClick, icon, label }) => (
  <button className={active ? "active" : ""} onClick={onClick}>
    {icon} {label}
  </button>
);

const SummaryCard = ({ title, value, change, negative }) => (
  <div className="summary-card">
    <h3>{title}</h3>
    <p className="summary-value">{value}</p>
    <p className={`summary-change ${negative ? "negative" : "positive"}`}>
      {change} from last period
    </p>
  </div>
);

export default EventAnalytics;
