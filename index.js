const rainy = './assets/images/icon-rain.webp';
const sunny = './assets/images/icon-sunny.webp';
const storm = './assets/images/icon-storm.webp';
const snow = './assets/images/icon-snow.webp';
const cloudy = './assets/images/icon-overcast.webp';
const foggy = './assets/images/icon-fog.webp';
const drizzle = './assets/images/icon-drizzle.webp';
const partlyCloudy = './assets/images/icon-partly-cloudy.webp';

let isCelsius = true;
let isKm = true;
let isMm = true;
let weatherData;

const nothingFound = document.getElementById("nothingFound");
const fail = document.getElementById("fail");
const retryBtn = document.getElementById("retry");
const searchSection = document.getElementById("search");
const headerH1 = document.getElementById("heading");
const input = document.getElementById("searchPlace");
const suggestion = document.getElementById("suggestion");
const selectedDay = document.getElementById("selectedDay");
const hourlyWeek = document.getElementById("hourlyWeek");
//------------------- TOGGLES --------------------
function toggleOptions() {
  const options = document.getElementById("options");
  options.style.display = options.style.display === "block" ? "none" : "block";
}

function weeksDisplay() {
    hourlyWeek.style.display = hourlyWeek.style.display === "block" ? "none" : "block";
}

function updateSwitchLabel() {
  const title = document.querySelector("#options h2");
  title.textContent = (isCelsius && isKm && isMm) ? "Switch to Imperial" : "Switch to Metric";
}
function displayContent() {
    const content = document.getElementById("content");
    content.style.display = "block"
}
// -------------------- MESSAGES --------------------
function hideAllMessages() {
    nothingFound.style.display = "none";
    fail.style.display = "none";
    searchSection.style.display = "flex";
    headerH1.style.display = "block";
    document.getElementById("content").style.display = "flex";
}

function showNothingFound() {
    hideAllMessages();
    nothingFound.style.display = "block";
}

function showFail() {
    hideAllMessages();
    fail.style.display = "flex";
    searchSection.style.display = "none";
    headerH1.style.display = "none";
    document.getElementById("content").style.display = "none";
}

// -------------------- LOADING --------------------
function loading() {
    const info = document.getElementById("information");
    info.innerHTML = `
        <div class="info"><p>Feels Like</p><h3 id="feelsLike">–</h3></div>
        <div class="info"><p>Humidity</p><h3 id="humidity">–</h3></div>
        <div class="info"><p>Wind</p><h3 id="km">–</h3></div>
        <div class="info"><p>Precipitation</p><h3 id="precipitation">–</h3></div>
    `;
    const times = document.getElementById("times");
    if (times) times.innerHTML = "";
    document.getElementById("place").style.backgroundColor = "#262540";
    document.getElementById("temperature").style.display = "none";
    document.getElementById("locationName").style.display = "none";
    document.getElementById("loading").style.display = "flex";
    document.getElementById("place").classList.add("loading");

}

function hideLoading() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("place").classList.remove("loading");
    document.getElementById("temperature").style.display = "flex";
    document.getElementById("locationName").style.display = "block";
}

// -------------------- UNITS --------------------
function setActiveOption(groupIds, activeId) {
    groupIds.forEach(id => {
        const el = document.getElementById(id);
        const oldCheck = el.querySelector("img.check");
        if (oldCheck) oldCheck.remove();
        el.classList.remove("active");
    });
    const activeEl = document.getElementById(activeId);
    const check = document.createElement("img");
    check.src = "./assets/images/icon-checkmark.svg";
    check.classList.add("check");
    activeEl.appendChild(check);
    activeEl.classList.add("active");
}

function mm(forceValue) {
    isMm = (forceValue !== undefined) ? forceValue : !isMm;
    if (weatherData) {
        const precipitation = weatherData.daily.precipitation_sum[0];
        document.getElementById("precipitation").textContent = isMm ?
            `${precipitation.toFixed(0)} mm` :
            `${(precipitation / 25.4).toFixed(1)} in`;
    }
    setActiveOption(["unitMm", "unitIn"], isMm ? "unitMm" : "unitIn");
}

function km(forceValue) {
    isKm = (forceValue !== undefined) ? forceValue : !isKm;
    if (weatherData) {
        const wind = weatherData.current_weather.windspeed;
        document.getElementById("km").textContent = isKm ?
            `${wind.toFixed(0)} km/h` :
            `${(wind * 0.621371).toFixed(0)} mph`;
    }
    setActiveOption(["unitKm", "unitMph"], isKm ? "unitKm" : "unitMph");
}

function celsius(forceValue) {
    isCelsius = (forceValue !== undefined) ? forceValue : !isCelsius;
    if (!weatherData) return;

    const temp = weatherData.current_weather.temperature;
    const feelsLike = weatherData.hourly.apparent_temperature[0];

    document.getElementById("currentTemperature").textContent = isCelsius ?
        `${temp.toFixed(0)}°` : `${((temp*9)/5+32).toFixed(0)}°`;

    document.getElementById("feelsLike").textContent = isCelsius ?
        `${feelsLike.toFixed(0)}°` : `${((feelsLike*9)/5+32).toFixed(0)}°`;

    const week = document.querySelectorAll('#weekDays .weekDays');
    weatherData.daily.time.forEach((day, i) => {
        if (!week[i]) return;
        week[i].querySelector(".maxTemp").textContent = isCelsius ?
            `${weatherData.daily.temperature_2m_max[i].toFixed(0)}°` :
            `${((weatherData.daily.temperature_2m_max[i]*9)/5+32).toFixed(0)}°`;
        week[i].querySelector(".minTemp").textContent = isCelsius ?
            `${weatherData.daily.temperature_2m_min[i].toFixed(0)}°` :
            `${((weatherData.daily.temperature_2m_min[i]*9)/5+32).toFixed(0)}°`;
    });

    setActiveOption(["unitC", "unitF"], isCelsius ? "unitC" : "unitF");
}

// -------------------- WEATHER IMAGES --------------------
function getWeatherImage(code) {
    if (code === 0) return sunny;
    if (code >= 1 && code <= 3) return cloudy;
    if (code === 45 || code === 48) return foggy;
    if (code >= 51 && code <= 67) return rainy;
    if (code >= 71 && code <= 77) return snow;
    if (code >= 80 && code <= 82) return drizzle;
    if (code >= 95 && code <= 99) return storm;
    return sunny;
}

// -------------------- UPDATE WEATHER --------------------

function updateWeatherData(hourIndex) {
    if (!weatherData || hourIndex === undefined || hourIndex < 0) return;

    const temp = weatherData.hourly.temperature_2m[hourIndex];
    const feelsLike = weatherData.hourly.apparent_temperature[hourIndex];
    const code = weatherData.hourly.weathercode[hourIndex];
    const humidity = weatherData.hourly.relative_humidity_2m[hourIndex];
    const windSpeed = weatherData.hourly.windspeed_10m ? weatherData.hourly.windspeed_10m[hourIndex] : 0;
    const precipitation = weatherData.hourly.precipitation ? weatherData.hourly.precipitation[hourIndex] : 0;

    document.getElementById("currentWeatherIcon").src = getWeatherImage(code);
    document.getElementById("currentTemperature").textContent =
        isCelsius ? `${temp.toFixed(0)}°` : `${((temp*9)/5+32).toFixed(0)}°`;
    document.getElementById("feelsLike").textContent =
        isCelsius ? `${feelsLike.toFixed(0)}°` : `${((feelsLike*9)/5+32).toFixed(0)}°`;
    document.getElementById("humidity").textContent = `${humidity}%`;
    document.getElementById("km").textContent = isKm ?
        `${windSpeed.toFixed(0)} km/h` :
        `${(windSpeed*0.621371).toFixed(0)} mph`;
    document.getElementById("precipitation").textContent = isMm ?
        `${precipitation.toFixed(0)} mm` :
        `${(precipitation/25.4).toFixed(1)} in`;
}

function renderHourlyForecast(dayName) {
    if (!weatherData) return;
    const container = document.getElementById("times");
    container.innerHTML = "";

    const dayDate = weatherData.daily.time.find(d =>
        new Date(d).toLocaleDateString("en-US",{ weekday:"long" }) === dayName
    );
    if (!dayDate) return;

    const now = new Date();
    const hours = weatherData.hourly.time;
    const temps = weatherData.hourly.temperature_2m;
    const feelsLikeTemps = weatherData.hourly.apparent_temperature;
    const codes = weatherData.hourly.weathercode;

    hours.forEach((h, i) => {
        const hourDate = new Date(h);
        if (hourDate.toDateString() !== new Date(dayDate).toDateString() || hourDate < now) return;

        const div = document.createElement("div");
        div.className = "hour";

        let hour = hourDate.getHours();
        const ampm = hour >= 12 ? "pm" : "am";
        hour = hour % 12 || 12;

        const icon = getWeatherImage(codes[i]);
        div.innerHTML = `
            <p><img src="${icon}" alt=""> ${hour}${ampm}</p>
            <p style="font-size:16px;">${isCelsius ? temps[i].toFixed(0)+"°C" : ((temps[i]*9)/5+32).toFixed(0)+"°F"}</p>
        `;

        div.addEventListener("click", () => {
            container.querySelectorAll(".hour.selected").forEach(e => e.classList.remove("selected"));
            div.classList.add("selected");

            updateWeatherData(i);

            document.getElementById("today").textContent = hourDate.toLocaleString("en-US", {
                weekday:"long", month:"short", day:"numeric", year:"numeric", hour:"numeric", minute:"numeric"
            });
        });

        container.appendChild(div);
    });
}

function updateMainWeatherForDay(dayName) {
    if (!weatherData) return;

    const dayIndex = weatherData.daily.time.findIndex(d =>
        new Date(d).toLocaleDateString("en-US", { weekday: "long" }) === dayName
    );
    if (dayIndex === -1) return;

    const firstHourIndex = weatherData.hourly.time.findIndex(h =>
        new Date(h).toDateString() === new Date(weatherData.daily.time[dayIndex]).toDateString()
    );

    updateWeatherData(firstHourIndex !== -1 ? firstHourIndex : 0);
}

// -------------------- SELECT CURRENT DAY --------------------
function selectCurrentDay() {
    if (!weatherData) return;

    const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

    // Seleciona o elemento do dia da semana
    const todayEl = Array.from(hourlyWeek.querySelectorAll("p"))
        .find(p => p.dataset.day === todayName);

    let selectedDayName = todayName;

    if (todayEl) {
        hourlyWeek.querySelectorAll("p").forEach(p => p.classList.remove("active"));
        todayEl.classList.add("active");

        if (selectedDay.firstChild) selectedDay.firstChild.textContent = todayEl.dataset.day + " ";
    }

    renderHourlyForecast(selectedDayName);
    updateMainWeatherForDay(selectedDayName);

    // Adiciona clique em todos os dias
    document.querySelectorAll("#hourlyWeek p").forEach(p => {
        p.addEventListener("click", () => {
            hourlyWeek.querySelectorAll("p").forEach(e => e.classList.remove("active"));
            p.classList.add("active");
            const dayName = p.dataset.day;
            if (selectedDay.firstChild) selectedDay.firstChild.textContent = dayName + " ";
            renderHourlyForecast(dayName);
            updateMainWeatherForDay(dayName);
        });
    });
}

// -------------------- GET DATA --------------------
async function getData() {
    const city = input.value.trim();
    hideAllMessages();
    if (!city) return;
    loading();

    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`);
        const data = await res.json();
        if (!data.results || !data.results[0]) {
            hideLoading();
            showNothingFound();
            return;
        }

        const { latitude, longitude, name, country, timezone } = data.results[0];

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&current_weather=true&timezone=${encodeURIComponent(timezone)}` +
            `&hourly=temperature_2m,apparent_temperature,weathercode,relative_humidity_2m,windspeed_10m,precipitation` +
            `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum`);
        if (!weatherRes.ok) throw new Error(`Weather API error: ${weatherRes.status}`);
        weatherData = await weatherRes.json();

        hideLoading();

        const currentHourIndex = weatherData.hourly.time.findIndex(t => new Date(t) >= new Date());
        updateWeatherData(currentHourIndex >= 0 ? currentHourIndex : 0);

        document.getElementById("country").textContent = `${name}, ${country}`;

        celsius(isCelsius);
        km(isKm);
        mm(isMm);

        const week = document.querySelectorAll('#weekDays .weekDays');
        weatherData.daily.time.forEach((day, i) => {
            if (!week[i]) return;
            week[i].querySelector(".dayName").textContent = new Date(day).toLocaleDateString("en-US",{ weekday:"short" });
            week[i].querySelector(".dayIcon").src = getWeatherImage(weatherData.daily.weathercode[i]);
            week[i].querySelector(".maxTemp").textContent = isCelsius ?
                `${weatherData.daily.temperature_2m_max[i].toFixed(0)}°` :
                `${((weatherData.daily.temperature_2m_max[i]*9)/5+32).toFixed(0)}°`;
            week[i].querySelector(".minTemp").textContent = isCelsius ?
                `${weatherData.daily.temperature_2m_min[i].toFixed(0)}°` :
                `${((weatherData.daily.temperature_2m_min[i]*9)/5+32).toFixed(0)}°`;
            week[i].dataset.day = new Date(day).toLocaleDateString("en-US",{ weekday:"long" });
        });

        selectCurrentDay();

    } catch(err) {
        console.error(err);
        hideLoading();
        showFail();
    }
}

// -------------------- INPUT EVENTS --------------------
input.addEventListener("keydown",(e)=>{ if(e.key==="Enter"){ getData(); } });
retryBtn.addEventListener("click", () => { if (input.value.trim()) getData(); });
input.addEventListener("input", ()=>{ nothingFound.style.display="none"; });





