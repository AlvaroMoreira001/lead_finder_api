from sqlalchemy import Column, DateTime, Float, Integer, String, func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255))
    phone = Column(String(100))
    website = Column(String(500))
    address = Column(String(500))
    rating = Column(Float)
    email = Column(String(255))
    instagram = Column(String(255))
    segment = Column(String(255))   # query usada na busca
    city = Column(String(255))      # extraída do endereço
    created_at = Column(DateTime(timezone=True), server_default=func.now())
