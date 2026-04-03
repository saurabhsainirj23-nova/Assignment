import React, { useState, useEffect } from 'react';
import WeatherCard from './components/WeatherCard';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState('metric');
  const [darkMode, setDarkMode] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [weatherCondition, setWeatherCondition] = useState('');

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    const savedUnit = localStorage.getItem('temperatureUnit');
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
    if (savedUnit) setUnit(savedUnit);
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
  }, []);

  useEffect(() => {
    let bodyClass = darkMode ? 'dark-mode ' : '';
    bodyClass += weatherCondition;
    document.body.className = bodyClass;
  }, [darkMode, weatherCondition]);

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  const convertTemp = (temp) => {
    if (unit === 'metric') return temp;
    return (temp * 9/5) + 32;
  };

  const getUnitSymbol = () => unit === 'metric' ? '°C' : '°F';

  const addToRecentSearches = (cityName) => {
    const newSearches = [cityName, ...recentSearches.filter(s => s !== cityName)].slice(0, 5);
    setRecentSearches(newSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
  };

  const getWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name.');
      setWeather(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`
      );
      const data = await res.json();

      if (data.cod !== 200) {
        setError(data.message || 'City not found. Please try again.');
        setWeather(null);
        setForecast([]);
        setHourlyForecast([]);
        setLoading(false);
        return;
      }

      setWeather(data);
      setWeatherCondition(data.weather[0].main.toLowerCase());
      addToRecentSearches(city);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`
      );
      const forecastData = await forecastRes.json();

      const daily = forecastData.list.filter(item =>
        item.dt_txt.includes('12:00:00')
      ).slice(0, 6);

      const hourly = forecastData.list.slice(0, 8);

      setForecast(daily);
      setHourlyForecast(hourly);
    } catch (err) {
      setError('Failed to fetch weather data. Please check your connection and try again.');
      setWeather(null);
      setForecast([]);
      setHourlyForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleUnit = () => {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(newUnit);
    localStorage.setItem('temperatureUnit', newUnit);
    if (weather) getWeather();
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  const handleRecentSearch = (searchCity) => {
    setCity(searchCity);
    getWeather();
  };

  const clearError = () => setError('');

  return (
    <div className="container">
      <div className="header">
        <h1>🌤️ Weather App</h1>
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
      
      <div className="search-container">
        <div className="search">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => { setCity(e.target.value); clearError(); }}
            onKeyDown={(e) => e.key === 'Enter' && getWeather()}
          />
          <button onClick={getWeather} disabled={loading}>
            {loading ? '...' : 'Search'}
          </button>
        </div>
        <button className="unit-toggle" onClick={toggleUnit}>
          °C/°F
        </button>
      </div>

      {recentSearches.length > 0 && (
        <div className="recent-searches">
          <span>Recent:</span>
          {recentSearches.map((search, index) => (
            <button 
              key={index} 
              className="recent-btn"
              onClick={() => handleRecentSearch(search)}
            >
              {search}
            </button>
          ))}
        </div>
      )}

      {error && <p className="error">{error}</p>}
      
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading weather data...</p>
        </div>
      )}
      
      {weather && !loading && (
        <WeatherCard 
          weather={weather} 
          forecast={forecast} 
          hourlyForecast={hourlyForecast}
          unit={unit}
          getUnitSymbol={getUnitSymbol}
          convertTemp={convertTemp}
        />
      )}
    </div>
  );
}

export default App;