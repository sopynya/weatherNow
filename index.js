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

function showNothingFound() {
    nothingFound.style.display = "block";
    fail.style.display = "none";
    searchSection.style.display = "flex";
    headerH1.style.display = "block";
    document.getElementById("content").style.display = "none";
}

function showFail() {
    fail.style.display = "flex";
    nothingFound.style.display = "none";
    searchSection.style.display = "none";
    headerH1.style.display = "none";
    document.getElementById("content").style.display = "none";
}

function hideAllMessages() {
    nothingFound.style.display = "none";
    fail.style.display = "none";
    searchSection.style.display = "flex";
    headerH1.style.display = "block";
    // Don't show content here - it will be shown after successful data load
}



function searchLoading() {
    const suggestion = document.getElementById("suggestion");
  suggestion.innerHTML = ""; 
  const p = document.createElement("li"); 
  p.innerHTML = `<img src="./assets/images/icon-loading.svg"> Searching...`;
  suggestion.appendChild(p);
  suggestion.style.display = "block";
}
function loading() {
    document.getElementById("information").innerHTML = `
        <div class="info">
          <p>Feels Like</p>
          <h3 id="feelsLike">–</h3>
        </div>
        <div class="info">
          <p>Humidity</p>
          <h3 id="humidity">–</h3>
        </div>
        <div class="info">
          <p>Wind</p>
          <h3 id="km">–</h3>
        </div>
        <div class="info">
          <p>Precipitation</p>
          <h3 id="precipitation">–</h3>
        </div>`

    const times = document.getElementById("times");
    if (times) times.innerHTML = "";

    document.getElementById("attribution").style.display = "block";

    document.querySelectorAll("#weekDays .weekDays").forEach(day => {
        const max = day.querySelector(".maxTemp");
        const min = day.querySelector(".minTemp");
        const icon = day.querySelector(".dayIcon");
        const name = day.querySelector(".dayName");

        if (max) max.textContent = "";
        if (min) min.textContent = "";
        if (name) name.textContent = "";
        if (icon) icon.src = ""; 
    });
    document.getElementById("temperature").style.display = "none"
    document.getElementById("locationName").style.display = "none"
    document.getElementById("place").style.background = "#262540";
    document.getElementById("loading").style.display = "flex";
    document.getElementById("place").classList.add("loading");
}
function hideLoading() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("place").style.background = "";
    document.getElementById("place").classList.remove("loading");
    document.getElementById("temperature").style.display = "flex"
    document.getElementById("locationName").style.display = "block"
}
function hideSearchLoading() {
  const suggestion = document.getElementById("suggestion");
  suggestion.innerHTML = "";
  suggestion.style.display = "none";
}

const selectedDay = document.getElementById("selectedDay");
const hourlyWeek = document.getElementById("hourlyWeek");

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
    // Find current selected hour or use first hour
    const selectedHour = document.querySelector(".hour.selected");
    let hourIndex = 0;
    if (selectedHour) {
      const allHours = document.querySelectorAll(".hour");
      hourIndex = Array.from(allHours).indexOf(selectedHour);
    }
    
    const precipitation = weatherData.hourly.precipitation[hourIndex];
    document.getElementById("precipitation").textContent = isMm ?
      `${precipitation.toFixed(1)} mm` :
      `${(precipitation / 25.4).toFixed(1)} in`;
  }
  setActiveOption(["unitMm", "unitIn"], isMm ? "unitMm" : "unitIn");
  updateSwitchLabel();
}

function km(forceValue) {
  isKm = (forceValue !== undefined) ? forceValue : !isKm;
  if (weatherData) {
    // Find current selected hour or use first hour
    const selectedHour = document.querySelector(".hour.selected");
    let hourIndex = 0;
    if (selectedHour) {
      const allHours = document.querySelectorAll(".hour");
      hourIndex = Array.from(allHours).indexOf(selectedHour);
    }
    
    const windSpeed = weatherData.hourly.windspeed_10m[hourIndex];
    document.getElementById("km").textContent = isKm ?
      `${windSpeed.toFixed(0)} km/h` :
      `${(windSpeed * 0.621371).toFixed(0)} mph`;
  }
  setActiveOption(["unitKm", "unitMph"], isKm ? "unitKm" : "unitMph");
  updateSwitchLabel();
}

function celsius(forceValue) {
  isCelsius = (forceValue !== undefined) ? forceValue : !isCelsius;
  if (!weatherData) return;

  // Find current selected hour or use first hour
  const selectedHour = document.querySelector(".hour.selected");
  let hourIndex = 0;
  if (selectedHour) {
    const allHours = document.querySelectorAll(".hour");
    hourIndex = Array.from(allHours).indexOf(selectedHour);
  }

  updateWeatherData(hourIndex);

  const week = document.querySelectorAll('#weekDays .weekDays');
  weatherData.daily.time.forEach((day, i) => {
    if (!week[i]) return;
    week[i].querySelector(".maxTemp").textContent = isCelsius ?
      `${weatherData.daily.temperature_2m_max[i].toFixed(0)}°` :
      `${((weatherData.daily.temperature_2m_max[i]*9)/5 +32).toFixed(0)}°`;
    week[i].querySelector(".minTemp").textContent = isCelsius ?
      `${weatherData.daily.temperature_2m_min[i].toFixed(0)}°` :
      `${((weatherData.daily.temperature_2m_min[i]*9)/5 +32).toFixed(0)}°`;
  });

  setActiveOption(["unitC","unitF"], isCelsius ? "unitC" : "unitF");
  updateSwitchLabel();
}

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

function updateWeatherData(hourIndex) {
  if (!weatherData || hourIndex === undefined || hourIndex < 0) return;

  const temp = weatherData.hourly.temperature_2m[hourIndex];
  const apparentTemp = weatherData.hourly.apparent_temperature[hourIndex];
  const code = weatherData.hourly.weathercode[hourIndex];
  const humidity = weatherData.hourly.relative_humidity_2m[hourIndex];
  const windSpeed = weatherData.hourly.windspeed_10m[hourIndex];
  const precipitation = weatherData.hourly.precipitation[hourIndex];

  document.getElementById("currentWeatherIcon").src = getWeatherImage(code);
  document.getElementById("currentTemperature").textContent =
    isCelsius ? `${temp.toFixed(0)}°` : `${((temp*9)/5+32).toFixed(0)}°`;
  document.getElementById("feelsLike").textContent =
    isCelsius ? `${apparentTemp.toFixed(0)}°` : `${((apparentTemp*9)/5+32).toFixed(0)}°`;
  document.getElementById("humidity").textContent = `${humidity}%`;
  document.getElementById("km").textContent = isKm ?
    `${windSpeed.toFixed(0)} km/h` :
    `${(windSpeed * 0.621371).toFixed(0)} mph`;
  document.getElementById("precipitation").textContent = isMm ?
    `${precipitation.toFixed(0)} mm` :
    `${(precipitation / 25.4).toFixed(1)} in`;
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

  updateWeatherData(firstHourIndex);
}

function renderHourlyForecast(dayName) {
  if (!weatherData) return;

  const container = document.getElementById("times");
  container.innerHTML = "";

  const dayDate = weatherData.daily.time.find(d =>
    new Date(d).toLocaleDateString("en-US", { weekday: "long" }) === dayName
  );
  if (!dayDate) return;

  const hours = weatherData.hourly.time;
  const temps = weatherData.hourly.apparent_temperature;
  const codes = weatherData.hourly.weathercode;

  hours.forEach((h, i) => {
    const date = new Date(h);
    if (date.toDateString() !== new Date(dayDate).toDateString()) return;

    const div = document.createElement("div");
    div.className = "hour";

    let hour = date.getHours();
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
      document.getElementById("today").textContent = date.toLocaleDateString("en-US", {
        weekday:"long", month:"short", day:"numeric", year:"numeric"
      });
    });

    container.appendChild(div);
  });
}

function selectCurrentDay() {
  if (!weatherData || !weatherData.current_weather) return;
  
  const currentTime = new Date(weatherData.current_weather.time);
  const todayName = currentTime.toLocaleDateString("en-US", { weekday: "long" });
  const todayEl = Array.from(hourlyWeek.querySelectorAll("p"))
    .find(p => p.dataset.day === todayName);

  if (todayEl) {
    hourlyWeek.querySelectorAll("p").forEach(p => p.classList.remove("active"));
    todayEl.classList.add("active");
    selectedDay.childNodes[0].textContent = todayName + " ";
    renderHourlyForecast(todayName);
    updateMainWeatherForDay(todayName);
  }
}

async function getData() {
  const city = document.getElementById("searchPlace").value.trim();
  hideAllMessages();
  if (!city) return;
  loading();

  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    
    if (!res.ok) {
      throw new Error(`Geocoding API error: ${res.status}`);
    }
    
    const data = await res.json();
    if (!data.results || !data.results[0]) {
      hideLoading();
      showNothingFound();
      return;
    }
    hideAllMessages();
    const { latitude, longitude, name, country, timezone } = data.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current_weather=true&timezone=${encodeURIComponent(timezone)}` +
      `&hourly=apparent_temperature,weathercode,relative_humidity_2m,temperature_2m,windspeed_10m,precipitation` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum`
    );
    
    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.status}`);
    }
    
    weatherData = await weatherRes.json();

    document.getElementById("today").textContent = new Date(weatherData.current_weather.time)
      .toLocaleDateString("en-US",{ weekday:"long", month:"short", day:"numeric", year:"numeric" });

    document.getElementById("country").textContent = `${name}, ${country}`;

    updateWeatherData(0);

    celsius(isCelsius);
    km(isKm);
    mm(isMm);

    const week = document.querySelectorAll('#weekDays .weekDays');
    weatherData.daily.time.forEach((day,i)=>{
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
    
    hideLoading();
    document.getElementById("content").style.display = "flex";

  } catch(err) {
    console.error(err);
    hideLoading();
    showFail();
  }
}

hourlyWeek.querySelectorAll("p").forEach(dayEl=>{
  dayEl.addEventListener("click", ()=>{
    hourlyWeek.querySelectorAll("p").forEach(d=>d.classList.remove("active"));
    dayEl.classList.add("active");

    selectedDay.childNodes[0].textContent = dayEl.dataset.day + " ";
    renderHourlyForecast(dayEl.dataset.day);
    updateMainWeatherForDay(dayEl.dataset.day);
    hourlyWeek.style.display = "none";
  });
});

const input = document.getElementById("searchPlace");
const suggestion = document.getElementById("suggestion");

input.addEventListener("input", async ()=>{
  const query = input.value.trim();
  if (!query){ suggestion.style.display="none"; return; }
  searchLoading();

  try{
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=4`);
    const data = await res.json();
    hideSearchLoading();
    suggestion.innerHTML="";
    if (!data.results) return;

    const seen = new Set();
    const results = data.results.filter(place=>{
      const key=`${place.name},${place.country}`;
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0,4);

    if (results.length === 0) {
  const li = document.createElement("li");
  li.textContent = query;
  li.addEventListener("click", () => {
    input.value = query;
    suggestion.style.display = "none";
    getData();
  });
  suggestion.innerHTML = "";
  suggestion.appendChild(li);
} else {
  suggestion.innerHTML = "";
  results.forEach(place => {
    const li = document.createElement("li");
    li.textContent = `${place.name}, ${place.country}`;
    li.addEventListener("click", () => {
      input.value = place.name;
      suggestion.style.display = "none";
      getData();
    });
    suggestion.appendChild(li);
  });
}

suggestion.style.display = suggestion.children.length ? "block" : "none";

  } catch(err){ console.error(err); suggestion.style.display="none"; }
});

document.addEventListener("click",(e)=>{
  if (!input.contains(e.target) && !suggestion.contains(e.target)) suggestion.style.display="none";
});

input.addEventListener("keydown",(e)=>{ if(e.key==="Enter"){ suggestion.style.display="none"; getData(); } });

window.onload = ()=>{
  setActiveOption(["unitC","unitF"],"unitC");
  setActiveOption(["unitKm","unitMph"],"unitKm");
  setActiveOption(["unitMm","unitIn"],"unitMm");
};

retryBtn.addEventListener("click", () => {
    fail.style.display = "none";
    hideAllMessages();
    const city = document.getElementById("searchPlace").value.trim();
    if (city) {
        getData();
    }
});

input.addEventListener("input", () => {
    nothingFound.style.display = "none";
});
