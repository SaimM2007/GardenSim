import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { useState } from 'react';

const PlantDetails = ({ plant, onAction, onRemove, onUpdateGrowth }) => {
  const [waterAmount, setWaterAmount] = useState(20);
  const [fertilizeAmount, setFertilizeAmount] = useState(10);

  return (
    <div className="plant-details" data-testid="plant-details">
      <div className="details-header">
        <span className="detail-emoji" data-testid="detail-plant-emoji">{plant.emoji}</span>
        <h2 className="detail-title" data-testid="detail-plant-name">{plant.plant_type}</h2>
      </div>

      <div className="status-section">
        <div className="status-item">
          <label>Growth Stage</label>
          <Progress value={plant.growth_stage} className="status-progress" data-testid="growth-progress" />
          <span className="status-value">{Math.round(plant.growth_stage)}%</span>
        </div>

        <div className="status-item">
          <label>Health</label>
          <Progress 
            value={plant.health} 
            className="status-progress health-bar" 
            data-testid="health-progress"
          />
          <span className="status-value">{Math.round(plant.health)}%</span>
        </div>

        <div className="status-item">
          <label>Water Level</label>
          <Progress value={plant.water_level} className="status-progress water-bar" data-testid="water-progress" />
          <span className="status-value">{Math.round(plant.water_level)}%</span>
        </div>

        <div className="nutrients-grid">
          <div className="nutrient-item">
            <label>Nitrogen (N)</label>
            <Progress value={plant.fertilizer_n} className="nutrient-bar" />
            <span className="nutrient-value">{Math.round(plant.fertilizer_n)}</span>
          </div>
          <div className="nutrient-item">
            <label>Phosphorus (P)</label>
            <Progress value={plant.fertilizer_p} className="nutrient-bar" />
            <span className="nutrient-value">{Math.round(plant.fertilizer_p)}</span>
          </div>
          <div className="nutrient-item">
            <label>Potassium (K)</label>
            <Progress value={plant.fertilizer_k} className="nutrient-bar" />
            <span className="nutrient-value">{Math.round(plant.fertilizer_k)}</span>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <label>Soil pH</label>
            <span className="info-value">{plant.soil_ph.toFixed(1)}</span>
          </div>
          {plant.has_pests && (
            <div className="alert-badge pest-alert" data-testid="pest-alert">🐛 Pests Detected!</div>
          )}
          {plant.has_disease && (
            <div className="alert-badge disease-alert" data-testid="disease-alert">🦠 Disease Detected!</div>
          )}
        </div>
      </div>

      <div className="actions-section">
        <div className="action-group">
          <label>Water Amount: {waterAmount}ml</label>
          <Slider
            value={[waterAmount]}
            onValueChange={(val) => setWaterAmount(val[0])}
            min={10}
            max={50}
            step={5}
            data-testid="water-slider"
          />
          <Button
            onClick={() => onAction(plant.id, 'water', waterAmount)}
            className="action-button water-button"
            data-testid="water-button"
          >
            💧 Water Plant
          </Button>
        </div>

        <div className="action-group">
          <label>Fertilizer Amount: {fertilizeAmount}g</label>
          <Slider
            value={[fertilizeAmount]}
            onValueChange={(val) => setFertilizeAmount(val[0])}
            min={5}
            max={30}
            step={5}
            data-testid="fertilize-slider"
          />
          <Button
            onClick={() => onAction(plant.id, 'fertilize', fertilizeAmount)}
            className="action-button fertilize-button"
            data-testid="fertilize-button"
          >
            🌿 Add Fertilizer
          </Button>
        </div>

        <div className="action-group">
          <Button
            onClick={() => onAction(plant.id, 'check_pests')}
            className="action-button check-button"
            data-testid="check-pests-button"
          >
            🔍 Check for Pests
          </Button>
        </div>

        {(plant.has_pests || plant.has_disease) && (
          <div className="action-group">
            <Button
              onClick={() => onAction(plant.id, 'treat')}
              className="action-button treat-button"
              data-testid="treat-button"
            >
              💊 Apply Treatment
            </Button>
          </div>
        )}

        <div className="action-group">
          <Button
            onClick={onUpdateGrowth}
            className="action-button grow-button"
            data-testid="update-growth-button"
          >
            ⚡ Update Growth
          </Button>
        </div>

        <div className="action-group">
          <Button
            onClick={() => onRemove(plant.id)}
            variant="destructive"
            className="action-button remove-button"
            data-testid="remove-plant-button"
          >
            🗑️ Remove Plant
          </Button>
        </div>
      </div>

      <style jsx>{`
        .plant-details {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .details-header {
          text-align: center;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(139, 195, 74, 0.2);
        }

        .detail-emoji {
          font-size: 5rem;
          display: block;
          margin-bottom: 0.75rem;
        }

        .detail-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.8rem;
          font-weight: 600;
          color: #33691e;
          text-transform: capitalize;
        }

        .status-section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .status-item label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #558b2f;
        }

        .status-value {
          font-size: 0.85rem;
          color: #7cb342;
          font-weight: 600;
        }

        .nutrients-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .nutrient-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nutrient-item label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #558b2f;
        }

        .nutrient-value {
          font-size: 0.75rem;
          color: #7cb342;
          font-weight: 600;
        }

        .info-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%);
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .info-item label {
          font-weight: 600;
          color: #558b2f;
        }

        .info-value {
          color: #7cb342;
          font-weight: 600;
        }

        .alert-badge {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .pest-alert {
          background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
          color: #f57f17;
        }

        .disease-alert {
          background: linear-gradient(135deg, #ffccbc 0%, #ffab91 100%);
          color: #d84315;
        }

        .actions-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: auto;
        }

        .action-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #558b2f;
        }

        .action-button {
          width: 100%;
          padding: 0.75rem;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .water-button {
          background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
          color: white;
        }

        .water-button:hover {
          background: linear-gradient(135deg, #29b6f6 0%, #039be5 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(41, 182, 246, 0.4);
        }

        .fertilize-button {
          background: linear-gradient(135deg, #8bc34a 0%, #7cb342 100%);
          color: white;
        }

        .fertilize-button:hover {
          background: linear-gradient(135deg, #7cb342 0%, #689f38 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(124, 179, 66, 0.4);
        }

        .check-button {
          background: linear-gradient(135deg, #ffd54f 0%, #ffca28 100%);
          color: #f57f17;
        }

        .check-button:hover {
          background: linear-gradient(135deg, #ffca28 0%, #ffc107 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 202, 40, 0.4);
        }

        .treat-button {
          background: linear-gradient(135deg, #ff8a65 0%, #ff7043 100%);
          color: white;
        }

        .treat-button:hover {
          background: linear-gradient(135deg, #ff7043 0%, #ff5722 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 112, 67, 0.4);
        }

        .grow-button {
          background: linear-gradient(135deg, #ba68c8 0%, #ab47bc 100%);
          color: white;
        }

        .grow-button:hover {
          background: linear-gradient(135deg, #ab47bc 0%, #9c27b0 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(171, 71, 188, 0.4);
        }

        .remove-button {
          background: linear-gradient(135deg, #e57373 0%, #ef5350 100%);
          color: white;
        }

        .remove-button:hover {
          background: linear-gradient(135deg, #ef5350 0%, #f44336 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 83, 80, 0.4);
        }
      `}</style>
    </div>
  );
};

export default PlantDetails;