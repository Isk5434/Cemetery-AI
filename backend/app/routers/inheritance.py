from fastapi import APIRouter, HTTPException
from app.models import InheritanceCheckRequest, InheritanceChecklistResult, ContractExtractionResult
from app.services import inheritance_service

router = APIRouter()

# Mock Contract for simulation (since we don't have a DB connected in this simple PoC step yet)
MOCK_CONTRACT = ContractExtractionResult(
    contract_holder="山田 太郎",
    plot_number="A-12-34",
    contract_date="2023-04-01",
    perpetual_lease_fee=1500000,
    management_fee=12000,
    transfer_conditions="使用者の死亡により祭祀を承継した者が名義変更を行う場合は、速やかに届け出なければならない。手数料として10,000円を要する。第三者への譲渡は原則禁止とする。",
    cancellation_conditions="",
    confidence_score=0.95
)

@router.post("/inheritance/check", response_model=InheritanceChecklistResult)
async def check_inheritance(request: InheritanceCheckRequest):
    """
    Generates an inheritance checklist. 
    In a real app, 'contract_id' would fetch the contract from DB.
    Here we use a mock contract to demonstrate the logic.
    """
    # Simulate fetching contract from DB
    contract = MOCK_CONTRACT
    
    result = await inheritance_service.generate_checklist(contract, request.heir_relationship)
    return result
