import torch
import torch.nn as nn
import numpy as np
from pathlib import Path
import pandas as pd
from sklearn.preprocessing import StandardScaler
import joblib
import os

MODELS_DIR = Path(__file__).parent / 'models'
MODELS_DIR.mkdir(exist_ok=True)

class GrowthPredictionModel(nn.Module):
    """Neural network for predicting plant growth based on environmental factors"""
    def __init__(self, input_size=7, hidden_size=64):
        super(GrowthPredictionModel, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu1 = nn.ReLU()
        self.dropout1 = nn.Dropout(0.2)
        self.fc2 = nn.Linear(hidden_size, 32)
        self.relu2 = nn.ReLU()
        self.dropout2 = nn.Dropout(0.2)
        self.fc3 = nn.Linear(32, 16)
        self.relu3 = nn.ReLU()
        self.fc4 = nn.Linear(16, 1)
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x):
        x = self.fc1(x)
        x = self.relu1(x)
        x = self.dropout1(x)
        x = self.fc2(x)
        x = self.relu2(x)
        x = self.dropout2(x)
        x = self.fc3(x)
        x = self.relu3(x)
        x = self.fc4(x)
        x = self.sigmoid(x)
        return x

class CropRecommendationModel(nn.Module):
    """Neural network for crop recommendation based on soil and weather"""
    def __init__(self, input_size=7, hidden_size=128, num_classes=22):
        super(CropRecommendationModel, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu1 = nn.ReLU()
        self.bn1 = nn.BatchNorm1d(hidden_size)
        self.dropout1 = nn.Dropout(0.3)
        self.fc2 = nn.Linear(hidden_size, 64)
        self.relu2 = nn.ReLU()
        self.bn2 = nn.BatchNorm1d(64)
        self.dropout2 = nn.Dropout(0.3)
        self.fc3 = nn.Linear(64, 32)
        self.relu3 = nn.ReLU()
        self.fc4 = nn.Linear(32, num_classes)
        
    def forward(self, x):
        x = self.fc1(x)
        x = self.relu1(x)
        x = self.bn1(x)
        x = self.dropout1(x)
        x = self.fc2(x)
        x = self.relu2(x)
        x = self.bn2(x)
        x = self.dropout2(x)
        x = self.fc3(x)
        x = self.relu3(x)
        x = self.fc4(x)
        return x

def train_growth_model(dataset_path):
    """Train the growth prediction model"""
    df = pd.read_csv(dataset_path)
    
    # Use environmental factors as features
    features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X = df[features].values
    
    # Create synthetic growth target (normalized combination of factors)
    y = ((df['N'] / 140) * 0.2 + 
         (df['P'] / 145) * 0.2 + 
         (df['K'] / 205) * 0.2 + 
         (df['humidity'] / 100) * 0.2 + 
         ((df['temperature'] - 10) / 35) * 0.2).values.reshape(-1, 1)
    
    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Convert to tensors
    X_tensor = torch.FloatTensor(X_scaled)
    y_tensor = torch.FloatTensor(y)
    
    # Initialize model
    model = GrowthPredictionModel(input_size=7)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    # Train
    model.train()
    epochs = 100
    for epoch in range(epochs):
        optimizer.zero_grad()
        outputs = model(X_tensor)
        loss = criterion(outputs, y_tensor)
        loss.backward()
        optimizer.step()
        
        if (epoch + 1) % 20 == 0:
            print(f'Growth Model - Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}')
    
    # Save model and scaler
    torch.save(model.state_dict(), MODELS_DIR / 'growth_model.pth')
    joblib.dump(scaler, MODELS_DIR / 'growth_scaler.pkl')
    print('Growth model saved!')
    return model, scaler

def train_crop_recommendation_model(dataset_path):
    """Train the crop recommendation model"""
    df = pd.read_csv(dataset_path)
    
    features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X = df[features].values
    
    # Encode labels
    from sklearn.preprocessing import LabelEncoder
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df['label'].values)
    
    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Convert to tensors
    X_tensor = torch.FloatTensor(X_scaled)
    y_tensor = torch.LongTensor(y)
    
    # Initialize model
    num_classes = len(label_encoder.classes_)
    model = CropRecommendationModel(input_size=7, num_classes=num_classes)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    # Train
    model.train()
    epochs = 150
    for epoch in range(epochs):
        optimizer.zero_grad()
        outputs = model(X_tensor)
        loss = criterion(outputs, y_tensor)
        loss.backward()
        optimizer.step()
        
        if (epoch + 1) % 30 == 0:
            print(f'Crop Model - Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}')
    
    # Save model, scaler, and encoder
    torch.save(model.state_dict(), MODELS_DIR / 'crop_model.pth')
    joblib.dump(scaler, MODELS_DIR / 'crop_scaler.pkl')
    joblib.dump(label_encoder, MODELS_DIR / 'label_encoder.pkl')
    joblib.dump(label_encoder.classes_.tolist(), MODELS_DIR / 'crop_classes.pkl')
    print(f'Crop recommendation model saved! Classes: {label_encoder.classes_.tolist()}')
    return model, scaler, label_encoder

def load_growth_model():
    """Load trained growth prediction model"""
    model = GrowthPredictionModel()
    model.load_state_dict(torch.load(MODELS_DIR / 'growth_model.pth', weights_only=True))
    model.eval()
    scaler = joblib.load(MODELS_DIR / 'growth_scaler.pkl')
    return model, scaler

def load_crop_model():
    """Load trained crop recommendation model"""
    crop_classes = joblib.load(MODELS_DIR / 'crop_classes.pkl')
    model = CropRecommendationModel(num_classes=len(crop_classes))
    model.load_state_dict(torch.load(MODELS_DIR / 'crop_model.pth', weights_only=True))
    model.eval()
    scaler = joblib.load(MODELS_DIR / 'crop_scaler.pkl')
    label_encoder = joblib.load(MODELS_DIR / 'label_encoder.pkl')
    return model, scaler, label_encoder

def predict_growth(model, scaler, environmental_data):
    """Predict plant growth"""
    # environmental_data: [N, P, K, temperature, humidity, ph, rainfall]
    with torch.no_grad():
        X_scaled = scaler.transform([environmental_data])
        X_tensor = torch.FloatTensor(X_scaled)
        prediction = model(X_tensor)
        return float(prediction[0][0])

def recommend_crops(model, scaler, label_encoder, environmental_data, top_k=5):
    """Recommend top crops based on environmental data"""
    with torch.no_grad():
        X_scaled = scaler.transform([environmental_data])
        X_tensor = torch.FloatTensor(X_scaled)
        outputs = model(X_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        top_probs, top_indices = torch.topk(probabilities, top_k)
        
        recommendations = []
        for prob, idx in zip(top_probs[0], top_indices[0]):
            crop_name = label_encoder.classes_[idx]
            recommendations.append({
                'crop': crop_name,
                'suitability': float(prob) * 100
            })
        return recommendations