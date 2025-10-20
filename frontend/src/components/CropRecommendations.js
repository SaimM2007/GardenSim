import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

const CropRecommendations = ({ recommendations, onClose, onSelectCrop }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="recommendations-dialog" data-testid="recommendations-dialog">
        <DialogHeader>
          <DialogTitle className="dialog-title">🌾 Recommended Crops for Your Climate</DialogTitle>
        </DialogHeader>
        
        <div className="recommendations-grid">
          {recommendations.map((rec, idx) => (
            <div 
              key={idx} 
              className="recommendation-card"
              onClick={() => onSelectCrop(rec.crop)}
              data-testid={`recommendation-${rec.crop}`}
            >
              <span className="rec-emoji">{rec.emoji}</span>
              <h3 className="rec-name">{rec.crop}</h3>
              <div className="suitability-bar">
                <div 
                  className="suitability-fill"
                  style={{ width: `${rec.suitability}%` }}
                />
              </div>
              <span className="suitability-text">{Math.round(rec.suitability)}% suitable</span>
            </div>
          ))}
        </div>

        <Button 
          onClick={onClose}
          className="close-button"
          data-testid="close-recommendations-button"
        >
          Close
        </Button>

        <style jsx>{`
          .recommendations-dialog {
            max-width: 800px;
          }

          .dialog-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.5rem;
            color: #33691e;
          }

          .recommendations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
          }

          .recommendation-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1.5rem 1rem;
            background: linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%);
            border: 2px solid #aed581;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s;
          }

          .recommendation-card:hover {
            background: linear-gradient(135deg, #dcedc8 0%, #c5e1a5 100%);
            border-color: #8bc34a;
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(139, 195, 74, 0.3);
          }

          .rec-emoji {
            font-size: 3.5rem;
            margin-bottom: 0.75rem;
          }

          .rec-name {
            font-size: 1rem;
            font-weight: 600;
            color: #33691e;
            margin-bottom: 0.75rem;
            text-transform: capitalize;
            text-align: center;
          }

          .suitability-bar {
            width: 100%;
            height: 8px;
            background: rgba(139, 195, 74, 0.2);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 0.5rem;
          }

          .suitability-fill {
            height: 100%;
            background: linear-gradient(90deg, #8bc34a 0%, #7cb342 100%);
            transition: width 0.5s ease;
          }

          .suitability-text {
            font-size: 0.85rem;
            color: #558b2f;
            font-weight: 600;
          }

          .close-button {
            width: 100%;
            background: linear-gradient(135deg, #8bc34a 0%, #7cb342 100%);
            color: white;
            padding: 0.75rem;
            border-radius: 10px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.3s;
          }

          .close-button:hover {
            background: linear-gradient(135deg, #7cb342 0%, #689f38 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(124, 179, 66, 0.4);
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default CropRecommendations;