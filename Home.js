document.addEventListener('DOMContentLoaded', function () {
    const appElement = document.getElementById('app');

    const state = {
        temperature: '',
        wind: '',
        freshSnowfall: '',
        slopeSteepness: '',
        slopeDirection: '',
        mountainName: '',
        dangerScore: 1.0,
        activeAlert: null,
        weatherData: null,
        locationStatus: null,
        lastLocation: null
    };

    // Function to calculate danger score
    function calculateDanger() {
        const steepnessValue = parseInt(state.slopeSteepness) || 0;
        const temperatureValue = parseInt(state.temperature) || 0;
        const windValue = parseInt(state.wind) || 0;
        const freshSnowfallValue = parseInt(state.freshSnowfall) || 0;

        state.dangerScore = calculateDangerFunction(steepnessValue, state.slopeDirection, temperatureValue, windValue, freshSnowfallValue);
        render();
    }

    // Function to call the saveMountainData function
    function saveMountainData() {
        if (state.mountainName === '') {
            state.activeAlert = 'failure';
            render();
            return;
        }
        
        // Set default values for empty input fields
        const temperatureValue = state.temperature === '' ? '0' : state.temperature;
        const freshSnowfallValue = state.freshSnowfall === '' ? '0' : state.freshSnowfall;
        const windValue = state.wind === '' ? '0' : state.wind;
        const slopeSteepnessValue = state.slopeSteepness === '' ? '0' : state.slopeSteepness;
        const slopeDirectionValue = state.slopeDirection === '' ? 'N' : state.slopeDirection;

        saveMountainDataFunction(
            temperatureValue,
            freshSnowfallValue,
            windValue,
            slopeSteepnessValue,
            slopeDirectionValue,
            state.mountainName,
            state.dangerScore,
            function (success) {
                if (success) {
                    state.activeAlert = 'success';
                    render();
                }
            }
        );
    }

    // Function to fetch weather data
    function fetchWeatherData() {
        if (state.locationStatus !== 'granted' || !state.lastLocation) {
            return;
        }

        const userLatitude = state.lastLocation.latitude;
        const userLongitude = state.lastLocation.longitude;
        const urlString = `https://api.open-meteo.com/v1/forecast?latitude=${userLatitude}&longitude=${userLongitude}&current_weather=true&hourly=temperature_2m,windspeed_10m`;

        fetch(urlString)
            .then(response => response.json())
            .then(data => {
                state.weatherData = data;
                state.temperature = data.current_weather.temperature.toFixed(0);
                state.wind = data.current_weather.windspeed.toFixed(0);
                render();
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    }

    // Function to render the UI
    function render() {
        const textColor = state.dangerScore <= 2.0 ? 'green' : state.dangerScore <= 3.5 ? 'orange' : 'red';

        appElement.innerHTML = `
            <div>
                <h1>Danger Predictor</h1>
                <input type="text" placeholder="Mountain Name" value="${state.mountainName}" oninput="state.mountainName = this.value; render()">
                <input type="text" placeholder="Temperature" value="${state.temperature}" oninput="state.temperature = this.value; render()"> °C
                <input type="text" placeholder="Wind" value="${state.wind}" oninput="state.wind = this.value; render()"> m/s
                <input type="text" placeholder="Fresh Snowfall" value="${state.freshSnowfall}" oninput="state.freshSnowfall = this.value; render()"> cm
                <input type="text" placeholder="Slope Steepness" value="${state.slopeSteepness}" oninput="state.slopeSteepness = this.value; render()"> °
                <input type="text" placeholder="Slope Direction" value="${state.slopeDirection}" oninput="state.slopeDirection = this.value; render()"> °
                <button onclick="fetchWeatherData()">Get Current Weather</button>
                <button onclick="calculateDanger()">Calculate Danger</button>
                <button onclick="saveMountainData()">Save Mountain Data</button>
                <p style="color: ${textColor}; font-size: 24px;">Danger Score: ${state.dangerScore.toFixed(2)}</p>
            </div>
        `;
    }

    // Initial render
    render();
});
