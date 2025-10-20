import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

const GardenGrid = ({ plants, onPlantClick, onPlantSeed, recommendations }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [customPlantName, setCustomPlantName] = useState('');

  const grid = Array(9).fill(null);
  plants.forEach(plant => {
    grid[plant.position] = plant;
  });

  const handleCellClick = (index) => {
    if (grid[index]) {
      onPlantClick(grid[index]);
    } else {
      setSelectedPosition(index);
    }
  };

  const handlePlantSeed = (plantType) => {
    if (selectedPosition !== null) {
      onPlantSeed(selectedPosition, plantType);
      setSelectedPosition(null);
      setCustomPlantName('');
    }
  };

  const handleCustomPlant = () => {
    if (customPlantName.trim()) {
      handlePlantSeed(customPlantName.trim());
    }
  };

  return (
    <div className="garden-grid-container">
      <h2 className="grid-title" data-testid="garden-title">Your Garden</h2>
      <div className="garden-grid" data-testid="garden-grid">
        {grid.map((plant, index) => (
          <div
            key={index}
            className={`grid-cell ${
              plant ? 'occupied' : 'empty'
            } ${plant?.growth_stage >= 100 ? 'mature' : ''}`}
            onClick={() => handleCellClick(index)}
            data-testid={`grid-cell-${index}`}
          >
            {plant ? (
              <div className="plant-display">
                <span className="plant-emoji" data-testid={`plant-emoji-${index}`}>{plant.emoji}</span>
                <div className="plant-info">
                  <span className="plant-name">{plant.plant_type}</span>
                  <div className="mini-progress">
                    <div 
                      className="mini-progress-bar"
                      style={{ width: `${plant.growth_stage}%` }}
                    />
                  </div>
                  <span className="growth-percent">{Math.round(plant.growth_stage)}%</span>
                </div>
              </div>
            ) : (
              <div className="empty-cell-content">
                <span className="plus-icon">+</span>
                <span className="empty-text">Plant Seed</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={selectedPosition !== null} onOpenChange={() => setSelectedPosition(null)}>
        <DialogContent className="plant-selection-dialog" data-testid="plant-selection-dialog">
          <DialogHeader>
            <DialogTitle>Select a Plant to Grow</DialogTitle>
          </DialogHeader>
          
          {recommendations.length > 0 && (
            <div className="recommended-section">
              <h3 className="section-title">Recommended for Your Climate</h3>
              <div className="plant-options">
                {recommendations.slice(0, 6).map((rec, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePlantSeed(rec.crop)}
                    className="plant-option"
                    data-testid={`plant-option-${rec.crop.toLowerCase()}`}
                  >
                    <span className="option-emoji">{rec.emoji}</span>
                    <span className="option-name">{rec.crop}</span>
                    <span className="suitability">{Math.round(rec.suitability)}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="custom-plant-section">
            <h3 className="section-title">Or Enter Custom Plant</h3>
            <div className="custom-input-group">
              <Input
                placeholder="Enter plant name..."
                value={customPlantName}
                onChange={(e) => setCustomPlantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomPlant()}
                data-testid="custom-plant-input"
              />
              <Button 
                onClick={handleCustomPlant}
                data-testid="plant-custom-button"
              >
                Plant
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .garden-grid-container {
          width: 100%;
        }

        .grid-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2rem;
          font-weight: 600;
          color: #33691e;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .garden-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .grid-cell {
          aspect-ratio: 1;
          border-radius: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .grid-cell.empty {
          background: linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%);
          border: 3px dashed #aed581;
        }

        .grid-cell.empty:hover {
          background: linear-gradient(135deg, #dcedc8 0%, #c5e1a5 100%);
          border-color: #8bc34a;
          transform: scale(1.05);
          box-shadow: 0 8px 24px rgba(139, 195, 74, 0.3);
        }

        .grid-cell.occupied {
          background: linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%);
          border: 3px solid #8bc34a;
          box-shadow: 0 4px 16px rgba(139, 195, 74, 0.2);
        }

        .grid-cell.occupied:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(139, 195, 74, 0.3);
        }

        .grid-cell.mature {
          background: linear-gradient(135deg, #c5e1a5 0%, #aed581 100%);
          border-color: #7cb342;
        }

        .empty-cell-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #8bc34a;
        }

        .plus-icon {
          font-size: 3rem;
          font-weight: 300;
        }

        .empty-text {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .plant-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          width: 100%;
        }

        .plant-emoji {
          font-size: 4rem;
          line-height: 1;
        }

        .plant-info {
          text-align: center;
          width: 100%;
        }

        .plant-name {
          font-weight: 600;
          color: #33691e;
          font-size: 0.9rem;
          display: block;
          margin-bottom: 0.5rem;
          text-transform: capitalize;
        }

        .mini-progress {
          width: 100%;
          height: 6px;
          background: rgba(139, 195, 74, 0.2);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.25rem;
        }

        .mini-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #8bc34a 0%, #7cb342 100%);
          transition: width 0.5s ease;
        }

        .growth-percent {
          font-size: 0.75rem;
          color: #558b2f;
          font-weight: 600;
        }

        .plant-selection-dialog {
          max-width: 600px;
        }

        .recommended-section, .custom-plant-section {
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #33691e;
          margin-bottom: 1rem;
        }

        .plant-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .plant-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%);
          border: 2px solid #aed581;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          height: auto;
        }

        .plant-option:hover {
          background: linear-gradient(135deg, #dcedc8 0%, #c5e1a5 100%);
          border-color: #8bc34a;
          transform: translateY(-2px);
        }

        .option-emoji {
          font-size: 2.5rem;
        }

        .option-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #33691e;
          text-transform: capitalize;
        }

        .suitability {
          font-size: 0.75rem;
          color: #7cb342;
          font-weight: 500;
        }

        .custom-input-group {
          display: flex;
          gap: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default GardenGrid;