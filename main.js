const api = {
  key: "fcc8de7015bbb202209bbf0261babf4c",
  base: "https://api.openweathermap.org/data/2.5/",
  geocoding: "https://api.openweathermap.org/geo/1.0/direct"
}

const searchbox = document.querySelector('.search-box');
searchbox.addEventListener('keypress', setQuery);
searchbox.addEventListener('input', debounce(filterLocations, 300)); // Add debounce

function setQuery(evt) {
  if (evt.keyCode == 13) {
    getResults(searchbox.value);
  }
}

function filterLocations() {
  const query = searchbox.value.trim();
  if (query.length < 3) {
    clearSuggestions();
    return;
  }

  fetch(`${api.geocoding}?q=${query}&limit=5&appid=${api.key}`)
    .then(response => response.json())
    .then(data => {
      const locations = data.map(item => ({
        name: item.name,
        country: item.country,
        state: item.state
      }));
      displayFilteredLocations(locations);
    })
    .catch(error => {
      console.error('Error fetching locations:', error);
      clearSuggestions();
    });
}

function displayFilteredLocations(locations) {
  const suggestionsList = document.querySelector('.suggestions-list') || createSuggestionsList();
  
  suggestionsList.innerHTML = '';
  locations.forEach(location => {
    const li = document.createElement('li');
    li.textContent = `${location.name}, ${location.state || ''} ${location.country}`.trim();
    li.addEventListener('click', () => {
      searchbox.value = li.textContent;
      getResults(li.textContent);
      clearSuggestions();
    });
    suggestionsList.appendChild(li);
  });
}

function createSuggestionsList() {
  const newList = document.createElement('ul');
  newList.className = 'suggestions-list';
  searchbox.parentNode.insertBefore(newList, searchbox.nextSibling);
  return newList;
}

function clearSuggestions() {
  const suggestionsList = document.querySelector('.suggestions-list');
  if (suggestionsList) {
    suggestionsList.innerHTML = '';
  }
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

function getResults(query) {
  // First, get the coordinates
  fetch(`${api.geocoding}?q=${query}&limit=1&appid=${api.key}`)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const { lat, lon } = data[0];
        // Now fetch the weather data using the coordinates
        return fetch(`${api.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${api.key}`);
      } else {
        throw new Error('Location not found');
      }
    })
    .then(response => response.json())
    .then(displayResults)
    .catch(error => {
      console.error('Error:', error);
      // You might want to display an error message to the user here
    });
}

function displayResults(weather) {
  let city = document.querySelector('.location .city');
  city.innerText = `${weather.name}, ${weather.sys.country}`;

  let now = new Date();
  let date = document.querySelector('.location .date');
  date.innerText = dateBuilder(now);

  let weatherIcon = document.querySelector('.weather-icon');
  weatherIcon.src = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
  weatherIcon.alt = weather.weather[0].description;

  let weather_el = document.querySelector('.current .weather');
  weather_el.innerText = weather.weather[0].main;

  // Temperature calculations and predictions
  let tempCelsius = Math.round(weather.main.temp);
  let tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);
  let tempKelvin = Math.round(tempCelsius + 273.15);

  // Predict future temperatures (simple linear increase for demonstration)
  let futureCelsius = tempCelsius + 2;
  let futureFahrenheit = Math.round((futureCelsius * 9/5) + 32);
  let futureKelvin = Math.round(futureCelsius + 273.15);

  let temp = document.querySelector('.current .temp');
  temp.innerHTML = `
    <div>Current: ${tempCelsius}°C / ${tempFahrenheit}°F / ${tempKelvin}K</div>
    <div>Predicted: ${futureCelsius}°C / ${futureFahrenheit}°F / ${futureKelvin}K</div>
  `;

  let feelsLike = document.querySelector('.current .feels-like span');
  feelsLike.innerHTML = `${Math.round(weather.main.feels_like)}°C`;

  let humidity = document.querySelector('.current .humidity span');
  humidity.innerHTML = `${weather.main.humidity}%`;

  let hilow = document.querySelector('.hi-low');
  hilow.innerText = `${Math.round(weather.main.temp_min)}°C / ${Math.round(weather.main.temp_max)}°C`;
}

function dateBuilder (d) {
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();

  return `${day} ${date} ${month} ${year}`;
}