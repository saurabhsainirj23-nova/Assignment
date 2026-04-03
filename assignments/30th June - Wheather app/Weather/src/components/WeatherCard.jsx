import React from 'react';
import './WeatherCard.css';

function WeatherCard({ weather, forecast, hourlyForecast, unit, getUnitSymbol, convertTemp }) {
  const icon = weather?.weather?.[0]?.icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="weather-container">
      <div className="current-weather">
        <div className="weather-main">
          <div className="weather-info">
            <h2 className="city-name">{weather.name}, {weather.sys.country}</h2>
            <p className="weather-description">{weather.weather[0].description}</p>
            <p className="temperature">{Math.round(convertTemp(weather.main.temp))}{getUnitSymbol()}</p>
            <p className="feels-like">Feels like {Math.round(convertTemp(weather.main.feels_like))}{getUnitSymbol()}</p>
          </div>
          <img className="weather-icon" src={iconUrl} alt="weather icon" />
        </div>

        <div className="weather-details">
          <div className="detail-item">
            <span className="detail-icon">💧</span>
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{weather.main.humidity}%</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">💨</span>
            <span className="detail-label">Wind</span>
            <span className="detail-value">{weather.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">🌡️</span>
            <span className="detail-label">Pressure</span>
            <span className="detail-value">{weather.main.pressure} hPa</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">👁️</span>
            <span className="detail-label">Visibility</span>
            <span className="detail-value">{(weather.visibility / 1000).toFixed(1)} km</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">☀️</span>
            <span className="detail-label">Sunrise</span>
            <span className="detail-value">{formatTime(weather.sys.sunrise)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">🌅</span>
            <span className="detail-label">Sunset</span>
            <span className="detail-value">{formatTime(weather.sys.sunset)}</span>
          </div>
        </div>
      </div>

      {hourlyForecast.length > 0 && (
        <div className="section">
          <h3>🌡️ Hourly Forecast</h3>
          <div className="hourly-scroll">
            {hourlyForecast.map((hour, index) => (
              <div className="hourly-item" key={index}>
                <p className="hour-time">{formatTime(hour.dt)}</p>
                <img 
                  src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`} 
                  alt="icon" 
                  className="hour-icon"
                />
                <p className="hour-temp">{Math.round(convertTemp(hour.main.temp))}{getUnitSymbol()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="section">
          <h3>📅 5-Day Forecast</h3>
          <div className="forecast">
            {forecast.map((day, index) => (
              <div className="forecast-day" key={index}>
                <p className="forecast-date">{formatDate(day.dt_txt)}</p>
                <img 
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} 
                  alt="icon" 
                  className="forecast-icon"
                />
                <p className="forecast-temp">{Math.round(convertTemp(day.main.temp))}{getUnitSymbol()}</p>
                <p className="forecast-condition">{day.weather[0].main}</p>
                <p className="forecast-humidity">💧 {day.main.humidity}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherCard;