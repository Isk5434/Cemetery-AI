from typing import List
from app.models import InheritanceCheckRequest, InheritanceChecklistResult, ContractExtractionResult
import google.generativeai as genai
import os
import json

# Standard requirements based on relationship
STANDARD_REQUIREMENTS = {
    "spouse": [
        "被相続人の出生から死亡までの連続した戸籍謄本",
        "相続人全員の戸籍謄本",
        "相続人全員の印鑑証明書",
        "遺産分割協議書（必要な場合）"
    ],
    "child": [
        "被相続人の出生から死亡までの連続した戸籍謄本",
        "相続人全員の戸籍謄本",
        "相続人全員の印鑑証明書",
        "遺産分割協議書"
    ],
    "third_party": [
        "特定縁故者であることを証明する書類",
        "家庭裁判所の審判書（必要な場合）"
    ]
}

async def generate_checklist(contract: ContractExtractionResult, relationship: str) -> InheritanceChecklistResult:
    """
    Generates a checklist based on standard rules and contract-specific clauses used by LLM.
    """
    
    # 1. Base requirements from rule-based logic
    requirements = STANDARD_REQUIREMENTS.get(relationship, ["一般承継手続き書類一式"]).copy()
    
    # 2. Add contract-specific requirements using LLM
    api_key = os.getenv("GEMINI_API_KEY")
    llm_notes = ""
    can_transfer = True # Default assumption
    
    if api_key and contract.transfer_conditions:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-pro')
            
            prompt = f"""
            Based on the following cemetery contract transfer clause, identify any specific conditions or extra documents required for a transfer to a '{relationship}'.
            
            Transfer Clause:
            {contract.transfer_conditions}
            
            Output strictly valid JSON with keys:
            - specific_requirements (list of strings): Any additional documents or fees mentioned.
            - can_transfer (boolean): Is transfer allowed?
            - notes (string): Brief explanation.
            """
            
            response = model.generate_content(prompt)
            json_text = response.text.replace("```json", "").replace("```", "").strip()
            analysis = json.loads(json_text)
            
            if "specific_requirements" in analysis and isinstance(analysis["specific_requirements"], list):
                requirements.extend(analysis["specific_requirements"])
            
            can_transfer = analysis.get("can_transfer", True)
            llm_notes = analysis.get("notes", "")

        except Exception as e:
            print(f"LLM Analysis failed: {e}")
            llm_notes = "AI解析スキップ（標準リストのみ表示）"
    else:
        # Fallback logic if no API key or no clauses
        if contract.transfer_conditions:
           llm_notes = "特記事項あり（条文を確認してください）"

    return InheritanceChecklistResult(
        required_documents=requirements,
        can_transfer=can_transfer,
        notes=llm_notes
    )
