import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

function MonthlyChart({ month, view }) {

    // Demo noise level data (in decibels)
    const demoData = {
        week: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            data: [42, 48, 55, 50], // Average weekly noise levels
        },
        day: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            data: [45, 47, 52, 49, 55, 60, 58], // Daily average noise levels
        },
        hour: {
            labels: ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"],
            data: [35, 40, 45, 50, 60, 55], // Hourly noise pattern
        },
    };

    const { labels, data } = demoData[view] || demoData.week;

    const chartData = {
        labels,
        datasets: [
            {
                label: `${month} Average Noise Level (${view})`,
                data,
                fill: true,
                backgroundColor: "rgba(255,99,132,0.2)",
                borderColor: "rgba(255,99,132,1)",
                tension: 0.3,
                pointRadius: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: "#fff",
                },
            },
            title: {
                display: true,
                text: `${month} (${view}) Noise Levels (dB)`,
                color: "#fff",
                font: { size: 16 },
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.y} dB`,
                },
            },
        },
        scales: {
            x: {
                ticks: { color: "#fff" },
                grid: { color: "rgba(255,255,255,0.1)" },
            },
            y: {
                ticks: {
                    color: "#fff",
                    callback: (value) => `${value} dB`,
                },
                grid: { color: "rgba(255,255,255,0.1)" },
                min: 30,
                max: 70,
            },
        },
    };

    return (
        <div style={{ height: "300px" }}>
            <Line data={chartData} options={options} />
        </div>
    );
}

export default MonthlyChart;
