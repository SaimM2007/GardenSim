import { Input } from './ui/input';
import { Button } from './ui/button';

const WeatherPanel = ({ weather, zipcode, onZipcodeChange, onFetchWeather, onGetRecommendations }) => {
  return (
    <div className="weather-panel" data-testid="weather-panel">
      <h2 className="panel-title">🌤️ Weather Data</h2>
      
      <div className="zipcode-input-group">
        <Input
          type="text"
          placeholder="Enter ZIP code"
          value={zipcode}
          onChange={(e) => onZipcodeChange(e.target.value)}
          data-testid="zipcode-input"
        />
        <Button 
          onClick={onFetchWeather}
          className="fetch-button"
          data-testid="fetch-weather-button"
        >
          Fetch
        </Button>
      </div>

      {weather && (
        <div className="weather-info">
          <div className="weather-location" data-testid="weather-location">
            📍 {weather.location}, {weather.region}
          </div>
          
          <div className="weather-grid">
            <div className="weather-item">
              <span className="weather-icon">🌡️</span>
              <div className="weather-details">
                <label>Temperature</label>
                <span className="weather-value" data-testid="temperature-value">{weather.temperature}°C</span>
              </div>
            </div>

            <div className="weather-item">
              <span className="weather-icon">💧</span>
              <div className="weather-details">
                <label>Humidity</label>
                <span className="weather-value" data-testid="humidity-value">{weather.humidity}%</span>
              </div>
            </div>

            <div className="weather-item">
              <span className="weather-icon">🌧️</span>
              <div className="weather-details">
                <label>Precipitation</label>
                <span className="weather-value" data-testid="precipitation-value">{weather.precipitation}mm</span>
              </div>
            </div>

            <div className="weather-item full-width">
              <span className="weather-icon">☁️</span>
              <div className="weather-details">
                <label>Condition</label>
                <span className="weather-value" data-testid="condition-value">{weather.condition}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={onGetRecommendations}
            className="recommend-button"
            data-testid="get-recommendations-button"
          >
            🌾 Get Crop Recommendations
          </Button>
        </div>
      )}

      <style jsx>{`
        .weather-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .panel-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #33691e;
          margin-bottom: 0.5rem;
        }

        .zipcode-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .fetch-button {
          background: linear-gradient(135deg, #8bc34a 0%, #7cb342 100%);
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .fetch-button:hover {
          background: linear-gradient(135deg, #7cb342 0%, #689f38 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(124, 179, 66, 0.4);
        }

        .weather-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .weather-location {
          font-size: 1rem;
          font-weight: 600;
          color: #558b2f;
          padding: 0.75rem;
          background: linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%);
          border-radius: 8px;
          text-align: center;
        }

        .weather-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .weather-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%);
          border-radius: 12px;
          transition: all 0.3s;
        }

        .weather-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(139, 195, 74, 0.2);
        }

        .weather-icon {
          font-size: 2rem;
        }

        .weather-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .weather-details label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #558b2f;
        }

        .weather-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: #33691e;
        }

        .recommend-button {
          width: 100%;
          background: linear-gradient(135deg, #ffd54f 0%, #ffca28 100%);
          color: #f57f17;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .recommend-button:hover {
          background: linear-gradient(135deg, #ffca28 0%, #ffc107 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 202, 40, 0.4);
        }
      `}</style>
    </div>
  );
};

export default WeatherPanel;