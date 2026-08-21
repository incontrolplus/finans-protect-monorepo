import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Activity } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function SystemCharts() {
    const [dataPoints, setDataPoints] = useState(Array.from({ length: 15 }, () => Math.floor(Math.random() * 100)));

    useEffect(() => {
        const interval = setInterval(() => {
            setDataPoints((prev) => {
                const newData = [...prev.slice(1), Math.floor(Math.random() * 100)];
                return newData;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const data = {
        labels: Array.from({ length: 15 }, (_, i) => `${i}s`),
        datasets: [
            {
                label: 'System Load (%)',
                data: dataPoints,
                borderColor: '#45f3ff',
                backgroundColor: 'rgba(69, 243, 255, 0.15)',
                borderWidth: 2,
                pointBackgroundColor: '#6a5af9',
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4, // Smooth curve
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(11, 12, 16, 0.9)',
                titleColor: '#fff',
                bodyColor: '#45f3ff',
                borderColor: 'rgba(69, 243, 255, 0.3)',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.4)',
                    font: {
                        size: 10,
                    },
                },
            },
            y: {
                min: 0,
                max: 100,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.4)',
                    font: {
                        size: 10,
                    },
                    stepSize: 25,
                },
            },
        },
        animation: {
            duration: 500,
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-ultra relative overflow-hidden mb-6"
        >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />

            <div className="relative">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-[#45f3ff]" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#45f3ff] to-[#6a5af9]">
                        Real-time System Telemetry
                    </span>
                </h2>

                <div className="w-full h-[250px] sm:h-[300px]">
                    <Line data={data} options={options} />
                </div>
            </div>
        </motion.div>
    );
}
