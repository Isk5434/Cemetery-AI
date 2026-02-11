import google.generativeai as genai
import os
import json
from app.models import ContractExtractionResult

# Mock response for fallback
MOCK_EXTRACTION_JSON = {
    "contract_holder": "山田 太郎",
    "plot_number": "A-12-34",
    "contract_date": "2023-04-01",
    "perpetual_lease_fee": 1500000,
    "management_fee": 12000,
    "management_fee_cycle": "Yearly",
    "transfer_conditions": "使用者の死亡により祭祀を承継した者が名義変更を行う場合は、速やかに届け出なければならない。手数料として10,000円を要する。",
    "cancellation_conditions": "使用者が墓所を使用しなくなったときは、原状に復して返還しなければならない。既納の永代使用料は返還しない。",
    "confidence_score": 0.95
}

async def extract_contract_info(raw_text: str) -> ContractExtractionResult:
    """
    Uses Gemini to parse raw text into a structured ContractExtractionResult.
    Falls back to mock data if API key is not configured.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("WARNING: No GEMINI_API_KEY found. Using Mock Extraction.")
        return ContractExtractionResult(**MOCK_EXTRACTION_JSON)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-pro')

        prompt = f"""
        You are an expert document parser. Extract the following information from the cemetery contract text below and return it as a JSON object.
        
        Text:
        {raw_text}
        
        Required Fields:
        - contract_holder (string): Full name of the contract holder.
        - plot_number (string): Plot number or section.
        - contract_date (YYYY-MM-DD): Date of contract signing.
        - perpetual_lease_fee (number): Fee for perpetual use.
        - management_fee (number): Recurring management fee.
        - management_fee_cycle (string): e.g., "Yearly".
        - transfer_conditions (string): Extract the exact clause text regarding transfer of ownership (名義変更).
        - cancellation_conditions (string): Extract the exact clause text regarding cancellation/return (返還).
        - confidence_score (0.0 to 1.0): Your confidence in the extraction.

        Return ONLY the JSON.
        """

        response = model.generate_content(prompt)
        
        # Cleanup response text to ensure valid JSON (remove backticks if present)
        json_text = response.text.replace("```json", "").replace("```", "").strip()
        
        data = json.loads(json_text)
        return ContractExtractionResult(**data)

    except Exception as e:
        print(f"Error calling Gemini API: {e}. Using Mock Extraction.")
        return ContractExtractionResult(**MOCK_EXTRACTION_JSON)
