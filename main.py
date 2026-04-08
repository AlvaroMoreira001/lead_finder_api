import io
from datetime import datetime
from typing import Optional

import pandas as pd
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal, init_db
from repositories.lead_repository import LeadRepository
from services.auth_service import AuthService
from services.enrichment_service import EnrichmentService
from services.google_places_service import GooglePlacesService

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY = "leadfinder-secret-key-troque-em-producao"
ALGORITHM = "HS256"

app = FastAPI(title="Lead Finder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://leadfinderapi-production.up.railway.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


# ── DB Dependency ─────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Auth helpers ──────────────────────────────────────────────────────────────
def create_token(email: str) -> str:
    return jwt.encode({"sub": email}, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    auth = AuthService(db)
    user = auth.get_user_by_email(email)
    if not user:
        raise credentials_exception
    return user


# ── Schemas ───────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str
    password: str


class SearchRequest(BaseModel):
    query: str
    max_results: int = 20


# ── Auth routes ───────────────────────────────────────────────────────────────
@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    auth = AuthService(db)
    user = auth.authenticate(email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="E-mail ou senha inválidos")
    return {"access_token": create_token(user.email), "token_type": "bearer"}


@app.post("/api/auth/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    auth = AuthService(db)
    if auth.get_user_by_email(data.email):
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    auth.create_user(email=data.email, password=data.password)
    return {"message": "Usuário criado com sucesso!"}


@app.get("/api/auth/me")
def me(current_user=Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email}


# ── Helpers ───────────────────────────────────────────────────────────────────
def build_variant_queries(query: str) -> list:
    sufixos = ["", " avaliado", " popular", " bem avaliado", " recomendado"]
    return [f"{query}{s}".strip() for s in sufixos]


# ── Leads routes ──────────────────────────────────────────────────────────────
@app.post("/api/leads/search")
def search_leads(
    data: SearchRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    places = GooglePlacesService()
    enrich = EnrichmentService()
    repo = LeadRepository(db)

    max_results = min(data.max_results, 60)

    if max_results <= 20:
        place_ids = places.search_places(data.query, max_results)
    else:
        place_ids = []
        seen = set()
        for variant in build_variant_queries(data.query):
            if len(place_ids) >= max_results:
                break
            needed = max_results - len(place_ids)
            ids = places.search_places(variant, min(needed + 5, 20))
            for pid in ids:
                if pid not in seen and len(place_ids) < max_results:
                    seen.add(pid)
                    place_ids.append(pid)

    if not place_ids:
        return {"new_leads": [], "skipped": 0, "total": 0}

    existing_ids = repo.get_existing_place_ids(place_ids)
    new_ids = [pid for pid in place_ids if pid not in existing_ids]
    skipped = len(place_ids) - len(new_ids)

    leads_data = []
    for pid in new_ids:
        detail = places.get_details(pid)
        extra = enrich.enrich(detail.get("website"))
        detail.update(extra)
        detail["place_id"] = pid
        leads_data.append(detail)

    saved = repo.save_leads(leads_data, segment=data.query)

    # Monta resposta com os dados salvos
    def lead_to_dict(lead):
        return {
            "id": lead.id,
            "place_id": lead.place_id,
            "name": lead.name,
            "phone": lead.phone,
            "email": lead.email,
            "instagram": lead.instagram,
            "website": lead.website,
            "address": lead.address,
            "city": lead.city,
            "rating": lead.rating,
            "segment": lead.segment,
            "created_at": lead.created_at.isoformat() if lead.created_at else None,
        }

    return {
        "new_leads": [lead_to_dict(l) for l in saved],
        "skipped": skipped,
        "total": len(place_ids),
    }


@app.get("/api/leads")
def get_leads(
    segment: Optional[str] = None,
    city: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = LeadRepository(db)

    dt_from = datetime.fromisoformat(date_from) if date_from else None
    dt_to = datetime.fromisoformat(date_to) if date_to else None

    leads = repo.get_all_leads(segment=segment, city=city, date_from=dt_from, date_to=dt_to)
    segments = repo.get_distinct_segments()
    cities = repo.get_distinct_cities()

    return {
        "leads": [
            {
                "id": l.id,
                "place_id": l.place_id,
                "name": l.name,
                "phone": l.phone,
                "email": l.email,
                "instagram": l.instagram,
                "website": l.website,
                "address": l.address,
                "city": l.city,
                "rating": l.rating,
                "segment": l.segment,
                "created_at": l.created_at.isoformat() if l.created_at else None,
            }
            for l in leads
        ],
        "total": len(leads),
        "segments": segments,
        "cities": cities,
    }


@app.get("/api/leads/export")
def export_leads(
    segment: Optional[str] = None,
    city: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = LeadRepository(db)

    dt_from = datetime.fromisoformat(date_from) if date_from else None
    dt_to = datetime.fromisoformat(date_to) if date_to else None

    leads = repo.get_all_leads(segment=segment, city=city, date_from=dt_from, date_to=dt_to)

    rows = [
        {
            "Nome": l.name,
            "Telefone": l.phone,
            "E-mail": l.email,
            "Instagram": l.instagram,
            "Website": l.website,
            "Endereço": l.address,
            "Cidade": l.city,
            "Avaliação": l.rating,
            "Segmento": l.segment,
            "Captado em": l.created_at.strftime("%d/%m/%Y") if l.created_at else "",
        }
        for l in leads
    ]

    df = pd.DataFrame(rows)
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Leads")
    buf.seek(0)

    filename = f"leads_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )