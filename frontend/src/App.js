import { useState, useEffect } from 'react';
import '@/App.css';
import axios from 'axios';
import GardenGrid from './components/GardenGrid';
import PlantDetails from './components/PlantDetails';
import WeatherPanel from './components/WeatherPanel';
import CropRecommendations from './components/CropRecommendations';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [weather, setWeather] = useState(null);
  const [zipcode, setZipcode] = useState('10001');
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [autoGrow, setAutoGrow] = useState(false);

  useEffect(() => {
    loadPlants();
    fetchWeather('10001');
  }, []);

  // Auto-growth simulation
  useEffect(() => {
    if (autoGrow && plants.length > 0) {
      const interval = setInterval(() => {
        updateAllPlantsGrowth();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoGrow, plants]);

  const loadPlants = async () => {
    try {
      const response = await axios.get(`${API}/plants`);
      setPlants(response.data);
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  };

  const fetchWeather = async (zip) => {
    try {
      const response = await axios.post(`${API}/weather`, { zipcode: zip });
      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast.error('Failed to fetch weather data');
    }
  };

  const fetchCropRecommendations = async () => {
    if (!weather) {
      toast.error('Please fetch weather data first');
      return;
    }

    try {
      const response = await axios.post(`${API}/crop-recommendations`, {
        temperature: weather.temperature,
        humidity: weather.humidity,
        rainfall: weather.precipitation || 100,
        soil_n: 50,
        soil_p: 50,
        soil_k: 50,
        soil_ph: 6.5
      });
      setRecommendations(response.data);
      setShowRecommendations(true);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to get crop recommendations');
    }
  };

  const plantSeed = async (position, plantType) => {
    try {
      await axios.post(`${API}/plants`, {
        position,
        plant_type: plantType
      });
      await loadPlants();
      toast.success(`${plantType} planted successfully!`);
    } catch (error) {
      console.error('Error planting seed:', error);
      toast.error(error.response?.data?.detail || 'Failed to plant seed');
    }
  };

  const removePlant = async (plantId) => {
    try {
      await axios.delete(`${API}/plants/${plantId}`);
      await loadPlants();
      setSelectedPlant(null);
      toast.success('Plant removed');
    } catch (error) {
      console.error('Error removing plant:', error);
      toast.error('Failed to remove plant');
    }
  };

  const performAction = async (plantId, action, amount = null) => {
    try {
      const response = await axios.post(`${API}/plants/${plantId}/action`, {
        action,
        amount
      });
      await loadPlants();
      setSelectedPlant(response.data);
      
      const actionMessages = {
        water: 'Plant watered',
        fertilize: 'Fertilizer applied',
        check_pests: 'Pest check completed',
        treat: 'Treatment applied'
      };
      toast.success(actionMessages[action] || 'Action completed');
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform action');
    }
  };

  const updateAllPlantsGrowth = async () => {
    for (const plant of plants) {
      try {
        await axios.post(`${API}/plants/${plant.id}/update-growth`, weather || {});
      } catch (error) {
        console.error(`Error updating growth for plant ${plant.id}:`, error);
      }
    }
    await loadPlants();
  };

  const handleWeatherUpdate = () => {
    fetchWeather(zipcode);
  };

  return (
    <div className="App min-h-screen">
      <Toaster position="top-right" richColors />
      
      <div className="garden-container">
        <header className="header">
          <div className="header-content">
            <h1 data-testid="app-title">🌱 GardenSim</h1>
            <p className="subtitle">AI-Powered Plant Growth Simulator</p>
          </div>
          <div className="auto-grow-toggle">
            <label>
              <input
                type="checkbox"
                checked={autoGrow}
                onChange={(e) => setAutoGrow(e.target.checked)}
                data-testid="auto-grow-toggle"
              />
              <span>Auto-Grow Simulation</span>
            </label>
          </div>
        </header>

        <div className="main-content">
          <div className="left-panel">
            <WeatherPanel
              weather={weather}
              zipcode={zipcode}
              onZipcodeChange={setZipcode}
              onFetchWeather={handleWeatherUpdate}
              onGetRecommendations={fetchCropRecommendations}
            />
          </div>

          <div className="center-panel">
            <GardenGrid
              plants={plants}
              onPlantClick={setSelectedPlant}
              onPlantSeed={plantSeed}
              recommendations={recommendations}
            />
          </div>

          <div className="right-panel">
            {selectedPlant ? (
              <PlantDetails
                plant={selectedPlant}
                onAction={performAction}
                onRemove={removePlant}
                onUpdateGrowth={() => updateAllPlantsGrowth()}
              />
            ) : (
              <div className="placeholder-panel">
                <div className="placeholder-content">
                  <span className="placeholder-icon">🌿</span>
                  <p>Select a plant to view details</p>
                  <p className="placeholder-hint">Click on any planted seed in the garden</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showRecommendations && (
          <CropRecommendations
            recommendations={recommendations}
            onClose={() => setShowRecommendations(false)}
            onSelectCrop={(crop) => {
              setShowRecommendations(false);
              toast.info(`Select an empty spot to plant ${crop}`);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;