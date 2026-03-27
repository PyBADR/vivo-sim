"""GCC Tier-1 Airport Node Definitions.

Metadata for all 9 critical GCC airports. Each airport is characterized by:
- Hub importance (regional connectivity, passenger throughput)
- Cargo relevance (freight capacity, logistics criticality)
- Fuel dependency (reliance on refined fuel supply)
- Strait proximity (sensitivity to Strait of Hormuz disruption)

Used in aviation layer of crisis propagation models.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class AirportNode:
    """Immutable representation of a GCC Tier-1 airport.

    Attributes:
        code: IATA airport code (3-letter)
        name: Official airport name
        city: Primary city served
        country: Country/UAE emirate
        hub_importance: Regional connectivity weight [0, 1]
        cargo_relevance: Freight criticality weight [0, 1]
        fuel_dependency: Refined fuel supply sensitivity [0, 1]
        strait_proximity: Strait of Hormuz disruption exposure [0, 1]
        latitude: Decimal degrees
        longitude: Decimal degrees
    """
    code: str
    name: str
    city: str
    country: str
    hub_importance: float
    cargo_relevance: float
    fuel_dependency: float
    strait_proximity: float
    latitude: float
    longitude: float


# GCC Airport definitions
KWI = AirportNode(
    code="KWI",
    name="Kuwait International Airport",
    city="Kuwait City",
    country="Kuwait",
    hub_importance=0.75,
    cargo_relevance=0.65,
    fuel_dependency=0.80,
    strait_proximity=0.85,
    latitude=29.4373,
    longitude=47.9689
)

RUH = AirportNode(
    code="RUH",
    name="King Khalid International Airport",
    city="Riyadh",
    country="Saudi Arabia",
    hub_importance=0.90,
    cargo_relevance=0.70,
    fuel_dependency=0.75,
    strait_proximity=0.45,
    latitude=24.9258,
    longitude=46.6988
)

DMM = AirportNode(
    code="DMM",
    name="King Fahd International Airport",
    city="Dammam",
    country="Saudi Arabia",
    hub_importance=0.80,
    cargo_relevance=0.75,
    fuel_dependency=0.85,
    strait_proximity=0.90,
    latitude=26.5310,
    longitude=49.9757
)

JED = AirportNode(
    code="JED",
    name="King Abdulaziz International Airport",
    city="Jeddah",
    country="Saudi Arabia",
    hub_importance=0.85,
    cargo_relevance=0.70,
    fuel_dependency=0.70,
    strait_proximity=0.30,
    latitude=21.5433,
    longitude=39.1569
)

DXB = AirportNode(
    code="DXB",
    name="Dubai International Airport",
    city="Dubai",
    country="United Arab Emirates",
    hub_importance=0.95,
    cargo_relevance=0.90,
    fuel_dependency=0.65,
    strait_proximity=0.75,
    latitude=25.2528,
    longitude=55.3644
)

AUH = AirportNode(
    code="AUH",
    name="Zayed International Airport",
    city="Abu Dhabi",
    country="United Arab Emirates",
    hub_importance=0.85,
    cargo_relevance=0.80,
    fuel_dependency=0.70,
    strait_proximity=0.70,
    latitude=24.4267,
    longitude=54.6516
)

DOH = AirportNode(
    code="DOH",
    name="Hamad International Airport",
    city="Doha",
    country="Qatar",
    hub_importance=0.85,
    cargo_relevance=0.75,
    fuel_dependency=0.72,
    strait_proximity=0.80,
    latitude=25.2731,
    longitude=51.6078
)

BAH = AirportNode(
    code="BAH",
    name="Bahrain International Airport",
    city="Manama",
    country="Bahrain",
    hub_importance=0.70,
    cargo_relevance=0.60,
    fuel_dependency=0.78,
    strait_proximity=0.95,
    latitude=26.1354,
    longitude=50.2375
)

MCT = AirportNode(
    code="MCT",
    name="Muscat International Airport",
    city="Muscat",
    country="Oman",
    hub_importance=0.75,
    cargo_relevance=0.70,
    fuel_dependency=0.75,
    strait_proximity=0.92,
    latitude=23.5933,
    longitude=58.2842
)


def get_gcc_airports() -> list[AirportNode]:
    """Return ordered list of all 9 GCC Tier-1 airports.

    Returns:
        List of AirportNode objects in geographic order.
    """
    return [KWI, RUH, DMM, JED, DXB, AUH, DOH, BAH, MCT]


GCC_AIRPORT_MAP: dict[str, AirportNode] = {
    "KWI": KWI,
    "RUH": RUH,
    "DMM": DMM,
    "JED": JED,
    "DXB": DXB,
    "AUH": AUH,
    "DOH": DOH,
    "BAH": BAH,
    "MCT": MCT,
}
