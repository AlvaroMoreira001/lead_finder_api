from typing import List, Optional
from sqlalchemy.orm import Session
from models import Lead


class LeadRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_existing_place_ids(self, place_ids: List[str]) -> set:
        existing = (
            self.db.query(Lead.place_id)
            .filter(Lead.place_id.in_(place_ids))
            .all()
        )
        return {row.place_id for row in existing}

    def save_leads(self, leads_data: List[dict], segment: str) -> List[Lead]:
        saved = []
        for data in leads_data:
            place_id = data.get("place_id")
            if not place_id:
                continue
            existing = self.db.query(Lead).filter(Lead.place_id == place_id).first()
            if existing:
                continue
            city = self._extract_city(data.get("address", "") or "")
            lead = Lead(
                place_id=place_id,
                name=data.get("name"),
                phone=data.get("phone"),
                website=data.get("website"),
                address=data.get("address"),
                rating=data.get("rating"),
                email=data.get("email"),
                instagram=data.get("instagram"),
                segment=segment,
                city=city,
            )
            self.db.add(lead)
            saved.append(lead)
        self.db.commit()
        return saved

    def get_all_leads(self, segment: Optional[str] = None, city: Optional[str] = None, date_from=None, date_to=None):
        q = self.db.query(Lead)
        if segment:
            q = q.filter(Lead.segment.ilike(f"%{segment}%"))
        if city:
            q = q.filter(Lead.city.ilike(f"%{city}%"))
        if date_from:
            q = q.filter(Lead.created_at >= date_from)
        if date_to:
            q = q.filter(Lead.created_at <= date_to)
        return q.order_by(Lead.created_at.desc()).all()

    def get_distinct_segments(self):
        rows = self.db.query(Lead.segment).distinct().all()
        return sorted([r.segment for r in rows if r.segment])

    def get_distinct_cities(self):
        rows = self.db.query(Lead.city).distinct().all()
        return sorted([r.city for r in rows if r.city])

    @staticmethod
    def _extract_city(address: str) -> str:
        """Tenta extrair a cidade do endereço formatado do Google."""
        if not address:
            return ""
        parts = [p.strip() for p in address.split(",")]
        # Endereço Google geralmente: Rua, Bairro, Cidade - Estado, CEP, País
        if len(parts) >= 3:
            return parts[-3].split("-")[0].strip()
        return parts[0] if parts else ""
