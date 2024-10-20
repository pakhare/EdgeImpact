let intervalId;
let previousTrafficVolume = 1000;
let previousUserCount = 500;
let previousLatency = 30;

document.getElementById('set-url-btn').addEventListener('click', async () => {
    const apiUrl = document.getElementById('api-url').value;

    if (!apiUrl) {
        alert('Please enter the API URL!');
        return;
    }

    // Set the Colab URL in the Flask app
    try {
        await fetch('/set_colab_url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ colab_url: apiUrl })
        });
        alert('Colab URL set successfully!');
        document.getElementById('simulate-btn').disabled = false; // Enable the Start Simulation button
    } catch (error) {
        alert('Failed to set Colab URL: ' + error.message);
    }
});

document.getElementById('simulate-btn').addEventListener('click', async () => {
    const apiUrl = document.getElementById('api-url').value;

    const deviceStatus = document.getElementById('device-status');
    const trafficStats = document.getElementById('traffic-stats');
    deviceStatus.innerText = 'Processing on IoT Edge Device...';

    let trafficVolume = previousTrafficVolume;
    let userCount = previousUserCount;
    let latency = previousLatency;

    // Wait for 10 seconds before starting the simulation
    await new Promise(resolve => setTimeout(resolve, 10000));

    intervalId = setInterval(async () => {
        try {
            // Randomize values within a small range
            trafficVolume += Math.floor(Math.random() * 21) - 10; // Change by -10 to +10
            userCount += Math.floor(Math.random() * 21) - 10; // Change by -10 to +10
            latency += Math.floor(Math.random() * 11) - 5; // Change by -5 to +5

            // Ensure values are within valid ranges
            trafficVolume = Math.max(800, Math.min(trafficVolume, 2000)); // Keep between 800 and 2000
            userCount = Math.max(100, Math.min(userCount, 1000)); // Keep between 100 and 1000
            latency = Math.max(10, Math.min(latency, 100)); // Keep between 10 and 100

            const response = await fetch('/simulate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'bypass-tunnel-reminder': 'any_value'
                },
                body: JSON.stringify({
                    traffic_volume: trafficVolume,
                    user_count: userCount,
                    latency: latency,
                    packet_loss: 0.1,
                    signal_strength: 75,
                    weather_condition: 'Clear',
                    hour: 12,
                    day: 5,
                    month: 10
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            const data = await response.json();
            console.log(data);
            deviceStatus.innerText = 'Processing Complete! Response: ' + JSON.stringify(data);

            // Extract the predicted energy value and check its validity
            const predictedEnergy = parseFloat(data.predicted_energy);
            if (!isNaN(predictedEnergy)) {
                // Update power bar only if the value is numeric
                const powerBar = document.getElementById('power-bar');
                const normalizedPowerLevel = Math.min(Math.max(predictedEnergy, 0), 100); // Ensure it stays within 0-100
                powerBar.style.width = normalizedPowerLevel + '%';
                powerBar.innerText = `Power Adjustment: ${normalizedPowerLevel.toFixed(2)}%`; // Display the power level

                // Update previous values
                previousTrafficVolume = trafficVolume;
                previousUserCount = userCount;
                previousLatency = latency;
            } else {
                // Retain previous values if the response is not valid
                trafficVolume = previousTrafficVolume;
                userCount = previousUserCount;
                latency = previousLatency;
            }

            trafficStats.innerText = `Traffic Volume: ${trafficVolume} Mbps, User Count: ${userCount}, Latency: ${latency} ms`;

        } catch (error) {
            deviceStatus.innerText = 'Error: ' + error.message;
            clearInterval(intervalId);
        }
    }, 2000);
});
