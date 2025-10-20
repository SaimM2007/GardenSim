import kagglehub
from pathlib import Path
import pandas as pd
import os

DATA_DIR = Path(__file__).parent / 'data'
DATA_DIR.mkdir(exist_ok=True)

def download_crop_dataset():
    """Download crop recommendation dataset from Kaggle"""
    try:
        print('Downloading crop recommendation dataset...')
        path = kagglehub.dataset_download("atharvaingle/crop-recommendation-dataset")
        print(f"Dataset downloaded to: {path}")
        
        # Find the CSV file
        csv_files = list(Path(path).glob('*.csv'))
        if csv_files:
            dataset_path = csv_files[0]
            print(f"Found dataset: {dataset_path}")
            
            # Copy to our data directory
            import shutil
            dest_path = DATA_DIR / 'Crop_recommendation.csv'
            shutil.copy(dataset_path, dest_path)
            print(f"Dataset copied to: {dest_path}")
            return dest_path
        else:
            print("No CSV file found in downloaded dataset")
            return None
    except Exception as e:
        print(f"Error downloading dataset: {e}")
        return None

def get_dataset_path():
    """Get path to the crop dataset, download if needed"""
    dataset_path = DATA_DIR / 'Crop_recommendation.csv'
    if not dataset_path.exists():
        dataset_path = download_crop_dataset()
    return dataset_path

def load_dataset():
    """Load the crop recommendation dataset"""
    dataset_path = get_dataset_path()
    if dataset_path and dataset_path.exists():
        return pd.read_csv(dataset_path)
    return None