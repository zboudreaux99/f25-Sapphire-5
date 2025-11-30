import React, { useEffect, useState, useRef } from "react";
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
    Filler,
} from "chart.js";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Title,
    Filler
);

function MonthlyChart({ month, view }) {
    const [labels, setLabels] = useState([]);
    const [values, setValues] = useState([]);
    const [loading, setLoading] = useState(true);

    const containerRef = useRef(null);

    // Re-render carousel container when Chart.js becomes visible
    useEffect(() => {
        const observer = new ResizeObserver(() => {
            window.dispatchEvent(new Event("resize"));
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const fetchSensorData = async () => {
            setLoading(true);

            const url =
                "http://localhost:8080/api/sensor/get-sensor-data" +
                "?sensor_id=1" +
                "&start_time=2024-01-01T00:00:00" +
                "&end_time=2025-01-01T00:00:00";

            try {
                const res = await fetch(url);
                const json = await res.json();

                if (!json || json.length === 0) {
                    setLabels([]);
                    setValues([]);
                    setLoading(false);
                    return;
                }

                // Sort by timestamp
                const sorted = json.sort(
                    (a, b) => new Date(a.reading_timestamp) - new Date(b.reading_timestamp)
                );

                let formattedLabels = [];
                let formattedValues = [];

                if (view === "week") {
                    const byWeek = {};
                    sorted.forEach((d) => {
                        const date = new Date(d.reading_timestamp);
                        const week = Math.ceil(date.getDate() / 7);
                        const label = `Week ${week}`;
                        if (!byWeek[label]) byWeek[label] = [];
                        byWeek[label].push(d.db);
                    });

                    formattedLabels = Object.keys(byWeek);
                    formattedValues = Object.values(byWeek).map(
                        (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
                    );
                }

                if (view === "day") {
                    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    const byDay = {};
                    sorted.forEach((d) => {
                        const day = dayNames[new Date(d.reading_timestamp).getDay()];
                        if (!byDay[day]) byDay[day] = [];
                        byDay[day].push(d.db);
                    });

                    formattedLabels = dayNames;
                    formattedValues = dayNames.map((d) => {
                        const arr = byDay[d] || [];
                        return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
                    });
                }

                if (view === "hour") {
                    const byHour = {};
                    sorted.forEach((d) => {
                        const h = new Date(d.reading_timestamp).getHours();
                        const label = `${h}:00`;
                        if (!byHour[label]) byHour[label] = [];
                        byHour[label].push(d.db);
                    });

                    formattedLabels = Object.keys(byHour);
                    formattedValues = Object.values(byHour).map(
                        (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
                    );
                }

                setLabels(formattedLabels);
                setValues(formattedValues);
            } catch (err) {
                console.error("Chart error:", err);
                setLabels([]);
                setValues([]);
            }

            setLoading(false);
        };

        fetchSensorData();
    }, [view, month]);

    if (loading) {
        return <p style={{ textAlign: "center" }}>Loading chart…</p>;
    }

    const chartData = {
        labels,
        datasets: [
            {
                label: `${month} Average Noise Level (${view})`,
                data: values,
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
        maintainAspectRatio: false,
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
                    label: (context) => `${context.parsed.y.toFixed(1)} dB`,
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
                    callback: (value) => `${value.toFixed(1)} dB`,
                },
                grid: { color: "rgba(255,255,255,0.1)" },
                min: 30,
                max: 100,
            },
        },
    };

    return (
        <div ref={containerRef} style={{ height: "300px" }}>
            {/* Forces re-render at correct size */}
            <Line data={chartData} options={options} redraw />
        </div>
    );
}

export default MonthlyChart;
