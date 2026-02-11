from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field

# --- Pydantic Models (API Layer) ---

class ContractBase(BaseModel):
    contract_holder: str = Field(..., description="Full name of the contract holder")
    plot_number: str = Field(..., description="Cemetery plot number")
    contract_date: Optional[date] = None
    perpetual_lease_fee: Optional[float] = None
    management_fee: Optional[float] = None
    management_fee_cycle: Optional[str] = "Yearly"
    transfer_conditions: Optional[str] = None
    cancellation_conditions: Optional[str] = None

class ContractExtractionResult(ContractBase):
    confidence_score: float = Field(..., ge=0.0, le=1.0)

class InheritanceCheckRequest(BaseModel):
    contract_id: int
    heir_relationship: str = Field(..., description="Relationship to deceased (e.g., 'spouse', 'child', 'sibling')")

class InheritanceChecklistResult(BaseModel):
    required_documents: List[str]
    can_transfer: bool
    notes: Optional[str] = None

# --- SQLAlchemy Models (DB Layer) ---
# Note: For full implementation we would use SQLModel or SQLAlchemy declarative base here.
# For this PoC step, we are defining the data structures needed for the service layer logic.
