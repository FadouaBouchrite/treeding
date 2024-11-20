// import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';

// // Replace this URL with your backend URL
// const socket = io('http://localhost:5000'); // Ensure this matches the server's URL and port

// const RealTimeStockData = () => {
//     const [closePrice, setClosePrice] = useState(null);

//     useEffect(() => {
//         // Connect to the WebSocket and listen for "real_time_data" event
//         socket.on('real_time_data', (data) => {
//             setClosePrice(data.close);
//         });

//         // Clean up on component unmount
//         return () => socket.off('real_time_data');
//     }, []);

//     return (
//         <div>
//             <h2>Apple Stock Real-Time Close Price</h2>
//             {closePrice !== null ? (
//                 <p>Close Price: ${closePrice.toFixed(2)}</p>
//             ) : (
//                 <p>Loading...</p>
//             )}
//         </div>
//     );
// };

// export default RealTimeStockData;


import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Line } from 'react-chartjs-2';

// Connect to the WebSocket server
const socket = io('http://localhost:5000'); // Replace with your backend server URL

const RealTimeStockGraph = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Apple Close Price',
                data: [],
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
            },
        ],
    });

    useEffect(() => {
        // Listen for real-time data from the WebSocket
        socket.on('real_time_data', (data) => {
            setChartData((prevData) => {
                // Create new labels and data points
                const newLabels = [...prevData.labels, new Date().toLocaleTimeString()];
                const newData = [...prevData.datasets[0].data, data.close];

                // Limit data points to the last 20 values to keep the graph manageable
                if (newLabels.length > 20) {
                    newLabels.shift();
                    newData.shift();
                }

                return {
                    labels: newLabels,
                    datasets: [
                        {
                            ...prevData.datasets[0],
                            data: newData,
                        },
                    ],
                };
            });
        });

        // Clean up the WebSocket listener on unmount
        return () => socket.off('real_time_data');
    }, []);

    return (
        <div>
            <h2>Real-Time Apple Stock Close Price</h2>
            <Line
                data={chartData}
                options={{
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Time',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Close Price ($)',
                            },
                        },
                    },
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                        },
                    },
                }}
            />
        </div>
    );
};

export default RealTimeStockGraph;
