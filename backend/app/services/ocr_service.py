from google.cloud import vision
import os
import io

# Mock text for fallback
MOCK_OCR_TEXT = """
墓地使用契約書
契約者: 山田 太郎
契約日: 2023年4月1日
墓所番号: A-12-34
永代使用料: 1,500,000円
年間管理費: 12,000円

第5条（名義変更）
使用者の死亡により祭祀を承継した者が名義変更を行う場合は、
速やかに届け出なければならない。手数料として10,000円を要する。

第8条（返還）
使用者が墓所を使用しなくなったときは、原状に復して返還しなければならない。
既納の永代使用料は返還しない。
"""

async def detect_text(path: str) -> str:
    """
    Detects text in the file located in path using Google Cloud Vision API.
    Falls back to mock text if credentials are not configured.
    """
    
    # Check for credentials
    if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        print("WARNING: No Google Cloud credentials found. Using Mock OCR.")
        return MOCK_OCR_TEXT

    try:
        client = vision.ImageAnnotatorClient()

        with io.open(path, 'rb') as image_file:
            content = image_file.read()

        image = vision.Image(content=content)
        response = client.text_detection(image=image)
        texts = response.text_annotations

        if response.error.message:
            raise Exception(f'{response.error.message}')

        if texts:
            return texts[0].description
        return ""
        
    except Exception as e:
        print(f"Error calling Vision API: {e}. Using Mock OCR.")
        return MOCK_OCR_TEXT
