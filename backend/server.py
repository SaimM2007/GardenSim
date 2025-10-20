from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import asyncio

# Import custom modules
from data_manager import get_dataset_path, load_dataset
from ml_models import (
    train_growth_model, train_crop_recommendation_model,
    load_growth_model, load_crop_model,
    predict_growth, recommend_crops
)
from weather_service import get_weather_by_zipcode

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Global variables for models
growth_model = None
growth_scaler = None
crop_model = None
crop_scaler = None
label_encoder = None

# Plant type to emoji mapping
PLANT_EMOJIS = {
    'rice': '🌾',
    'maize': '🌽',
    'chickpea': '🫘',
    'kidneybeans': '🫘',
    'pigeonpeas': '🫘',
    'mothbeans': '🫘',
    'mungbean': '🫛',
    'blackgram': '🫘',
    'lentil': '🫘',
    'pomegranate': '🍎',
    'banana': '🍌',
    'mango': '🥭',
    'grapes': '🍇',
    'watermelon': '🍉',
    'muskmelon': '🍈',
    'apple': '🍎',
    'orange': '🍊',
    'papaya': '🫐',
    'coconut': '🥥',
    'cotton': '☁️',
    'jute': '🌿',
    'coffee': '☕'
}

# Models
class Plant(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    position: int  # 0-8 for 3x3 grid
    plant_type: str
    emoji: str
    water_level: float = 50.0  # 0-100
    fertilizer_n: float = 50.0  # 0-100
    fertilizer_p: float = 50.0
    fertilizer_k: float = 50.0
    health: float = 100.0  # 0-100
    growth_stage: float = 0.0  # 0-100
    soil_ph: float = 6.5
    has_pests: bool = False
    has_disease: bool = False
    planted_date: str
    last_watered: Optional[str] = None
    last_fertilized: Optional[str] = None

class PlantCreate(BaseModel):
    position: int
    plant_type: str

class PlantAction(BaseModel):
    action: str  # 'water', 'fertilize', 'check_pests', 'treat'
    amount: Optional[float] = None

class WeatherRequest(BaseModel):
    zipcode: str

class CropRecommendationRequest(BaseModel):
    temperature: float
    humidity: float
    rainfall: float
    soil_n: Optional[float] = 50.0
    soil_p: Optional[float] = 50.0
    soil_k: Optional[float] = 50.0
    soil_ph: Optional[float] = 6.5

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    global growth_model, growth_scaler, crop_model, crop_scaler, label_encoder
    
    logging.info("Starting up GardenSim backend...")
    
    # Get dataset
    dataset_path = get_dataset_path()
    if not dataset_path:
        logging.error("Failed to get dataset")
        return
    
    # Check if models exist, train if not
    models_dir = ROOT_DIR / 'models'
    growth_model_path = models_dir / 'growth_model.pth'
    crop_model_path = models_dir / 'crop_model.pth'
    
    if not growth_model_path.exists() or not crop_model_path.exists():
        logging.info("Training models...")
        try:
            train_growth_model(dataset_path)
            train_crop_recommendation_model(dataset_path)
        except Exception as e:
            logging.error(f"Error training models: {e}")
    
    # Load models
    try:
        growth_model, growth_scaler = load_growth_model()
        crop_model, crop_scaler, label_encoder = load_crop_model()
        logging.info("Models loaded successfully!")
    except Exception as e:
        logging.error(f"Error loading models: {e}")

@api_router.get("/")
async def root():
    return {"message": "GardenSim API is running!"}

@api_router.post("/plants", response_model=Plant)
async def create_plant(plant_input: PlantCreate):
    """Plant a new seed in the garden"""
    # Check if position is already occupied
    existing = await db.plants.find_one({"position": plant_input.position})
    if existing:
        raise HTTPException(status_code=400, detail="Position already occupied")
    
    plant_type_lower = plant_input.plant_type.lower()
    emoji = PLANT_EMOJIS.get(plant_type_lower, '🌱')
    
    plant = Plant(
        position=plant_input.position,
        plant_type=plant_input.plant_type,
        emoji=emoji,
        planted_date=datetime.now(timezone.utc).isoformat()
    )
    
    doc = plant.model_dump()
    await db.plants.insert_one(doc)
    return plant

@api_router.get("/plants", response_model=List[Plant])
async def get_plants():
    """Get all plants in the garden"""
    plants = await db.plants.find({}, {"_id": 0}).to_list(100)
    return plants

@api_router.get("/plants/{plant_id}", response_model=Plant)
async def get_plant(plant_id: str):
    """Get a specific plant"""
    plant = await db.plants.find_one({"id": plant_id}, {"_id": 0})
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant

@api_router.delete("/plants/{plant_id}")
async def delete_plant(plant_id: str):
    """Remove a plant from the garden"""
    result = await db.plants.delete_one({"id": plant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plant not found")
    return {"message": "Plant removed"}

@api_router.post("/plants/{plant_id}/action")
async def plant_action(plant_id: str, action_input: PlantAction):
    """Perform an action on a plant"""
    plant = await db.plants.find_one({"id": plant_id}, {"_id": 0})
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    updates = {}
    action = action_input.action
    
    if action == 'water':
        # Increase water level
        new_water = min(100.0, plant['water_level'] + (action_input.amount or 20.0))
        updates['water_level'] = new_water
        updates['last_watered'] = datetime.now(timezone.utc).isoformat()
        
        # Overwatering can harm plants
        if new_water > 90:
            updates['health'] = max(0, plant['health'] - 5)
            
    elif action == 'fertilize':
        # Add fertilizer
        amount = action_input.amount or 10.0
        updates['fertilizer_n'] = min(100.0, plant['fertilizer_n'] + amount)
        updates['fertilizer_p'] = min(100.0, plant['fertilizer_p'] + amount)
        updates['fertilizer_k'] = min(100.0, plant['fertilizer_k'] + amount)
        updates['last_fertilized'] = datetime.now(timezone.utc).isoformat()
        
    elif action == 'check_pests':
        # Randomly determine if pests/disease detected
        import random
        has_pests = random.random() < 0.15
        has_disease = random.random() < 0.10
        updates['has_pests'] = has_pests
        updates['has_disease'] = has_disease
        
        if has_pests:
            updates['health'] = max(0, plant['health'] - 10)
        if has_disease:
            updates['health'] = max(0, plant['health'] - 15)
            
    elif action == 'treat':
        # Treat pests and diseases
        updates['has_pests'] = False
        updates['has_disease'] = False
        updates['health'] = min(100.0, plant['health'] + 20)
    
    if updates:
        await db.plants.update_one({"id": plant_id}, {"$set": updates})
    
    # Get updated plant
    updated_plant = await db.plants.find_one({"id": plant_id}, {"_id": 0})
    return updated_plant

@api_router.post("/plants/{plant_id}/update-growth")
async def update_plant_growth(plant_id: str, weather_data: Optional[dict] = None):
    """Update plant growth based on ML prediction"""
    plant = await db.plants.find_one({"id": plant_id}, {"_id": 0})
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    if not growth_model or not growth_scaler:
        raise HTTPException(status_code=500, detail="Growth model not loaded")
    
    # Prepare environmental data
    temperature = weather_data.get('temperature', 25.0) if weather_data else 25.0
    humidity = weather_data.get('humidity', 60.0) if weather_data else 60.0
    rainfall = weather_data.get('precipitation', 0.0) if weather_data else 0.0
    
    environmental_data = [
        plant['fertilizer_n'],  # N
        plant['fertilizer_p'],  # P
        plant['fertilizer_k'],  # K
        temperature,
        humidity,
        plant['soil_ph'],
        rainfall
    ]
    
    # Predict growth increment
    growth_increment = predict_growth(growth_model, growth_scaler, environmental_data) * 100
    
    # Apply penalties
    if plant['water_level'] < 20:
        growth_increment *= 0.5  # Low water slows growth
    if plant['water_level'] > 90:
        growth_increment *= 0.7  # Overwatering slows growth
    if plant['has_pests']:
        growth_increment *= 0.6
    if plant['has_disease']:
        growth_increment *= 0.5
    
    # Update growth and decrease water/fertilizer
    new_growth = min(100.0, plant['growth_stage'] + growth_increment)
    new_water = max(0, plant['water_level'] - 2.0)
    new_n = max(0, plant['fertilizer_n'] - 1.0)
    new_p = max(0, plant['fertilizer_p'] - 1.0)
    new_k = max(0, plant['fertilizer_k'] - 1.0)
    
    updates = {
        'growth_stage': new_growth,
        'water_level': new_water,
        'fertilizer_n': new_n,
        'fertilizer_p': new_p,
        'fertilizer_k': new_k
    }
    
    await db.plants.update_one({"id": plant_id}, {"$set": updates})
    
    updated_plant = await db.plants.find_one({"id": plant_id}, {"_id": 0})
    return updated_plant

@api_router.post("/weather")
async def get_weather(weather_req: WeatherRequest):
    """Get weather data for a location"""
    weather_data = await get_weather_by_zipcode(weather_req.zipcode)
    return weather_data

@api_router.post("/crop-recommendations")
async def get_crop_recommendations(req: CropRecommendationRequest):
    """Get crop recommendations based on environmental conditions"""
    if not crop_model or not crop_scaler or not label_encoder:
        raise HTTPException(status_code=500, detail="Crop recommendation model not loaded")
    
    environmental_data = [
        req.soil_n,
        req.soil_p,
        req.soil_k,
        req.temperature,
        req.humidity,
        req.soil_ph,
        req.rainfall
    ]
    
    recommendations = recommend_crops(
        crop_model, crop_scaler, label_encoder, environmental_data, top_k=8
    )
    
    # Add emojis
    for rec in recommendations:
        rec['emoji'] = PLANT_EMOJIS.get(rec['crop'].lower(), '🌱')
    
    return recommendations

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()