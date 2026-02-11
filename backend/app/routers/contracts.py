from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models import ContractExtractionResult
from app.services import ocr_service, extraction_service
import shutil
import os

router = APIRouter()

TEMP_UPLOAD_DIR = "temp_uploads"
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)

@router.post("/contracts/extract", response_model=ContractExtractionResult)
async def extract_contract_data(file: UploadFile = File(...)):
    """
    Uploads a contract image, runs OCR, and extracts structured data using LLM.
    """
    temp_file_path = f"{TEMP_UPLOAD_DIR}/{file.filename}"
    
    try:
        # Save uploaded file temporarily
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 1. OCR (Google Vision)
        raw_text = await ocr_service.detect_text(temp_file_path)
        
        # 2. LLM Extraction (Gemini)
        structured_data = await extraction_service.extract_contract_info(raw_text)
        
        return structured_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
