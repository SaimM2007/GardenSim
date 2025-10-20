import requests
import os
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY')
WEATHER_API_BASE = 'http://api.weatherapi.com/v1'

async def get_weather_by_zipcode(zipcode: str):
    """Fetch current weather data from WeatherAPI"""
    try:
        url = f"{WEATHER_API_BASE}/current.json"
        params = {
            'key': WEATHER_API_KEY,
            'q': zipcode,
            'aqi': 'no'
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Extract relevant weather data
        weather_data = {
            'temperature': data['current']['temp_c'],
            'humidity': data['current']['humidity'],
            'condition': data['current']['condition']['text'],
            'precipitation': data['current']['precip_mm'],
            'location': data['location']['name'],
            'region': data['location']['region'],
            'country': data['location']['country'],
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        return weather_data
    except Exception as e:
        logger.error(f"Error fetching weather data: {e}")
        # Return default weather data if API fails
        return {
            'temperature': 25.0,
            'humidity': 60.0,
            'condition': 'Unknown',
            'precipitation': 0.0,
            'location': 'Unknown',
            'region': '',
            'country': '',
            'timestamp': datetime.now(timezone.utc).isoformat()
        }