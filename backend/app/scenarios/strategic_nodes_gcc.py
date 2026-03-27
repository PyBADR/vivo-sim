"""Strategic GCC nodes: energy, maritime, financial, utilities, and social.

Non-airport crisis nodes for VIVO SIM GCC Crisis Intelligence Platform.
Each node can be converted to CrisisNode for scenario packs.
"""

# Energy nodes
ENERGY_NODES = [
    {
        "id": "energy_abqaiq",
        "label": "Abqaiq Plants",
        "node_type": "energy_production",
        "country": "Saudi Arabia",
        "tags": ["energy", "oil", "production", "critical"],
        "criticality": 0.96,
        "vulnerability": 0.65,
        "exposure": 0.88,
        "metadata": {
            "capacity_mbpd": 550,
            "global_output_pct": 5.0,
            "recovery_time_days": 30,
        },
    },
    {
        "id": "energy_khurais",
        "label": "Khurais Oil Complex",
        "node_type": "energy_production",
        "country": "Saudi Arabia",
        "tags": ["energy", "oil", "production", "tier1"],
        "criticality": 0.92,
        "vulnerability": 0.62,
        "exposure": 0.85,
        "metadata": {
            "capacity_mbpd": 300,
            "global_output_pct": 2.5,
            "recovery_time_days": 20,
        },
    },
    {
        "id": "energy_ras_tanura",
        "label": "Ras Tanura Refining Node",
        "node_type": "energy_refining",
        "country": "Saudi Arabia",
        "tags": ["energy", "refining", "export", "critical"],
        "criticality": 0.93,
        "vulnerability": 0.60,
        "exposure": 0.87,
        "metadata": {
            "capacity_mbpd": 550,
            "global_refining_pct": 4.2,
            "recovery_time_days": 25,
        },
    },
    {
        "id": "energy_ruwais",
        "label": "Ruwais Refinery",
        "node_type": "energy_refining",
        "country": "UAE",
        "tags": ["energy", "refining", "uae", "tier1"],
        "criticality": 0.88,
        "vulnerability": 0.58,
        "exposure": 0.82,
        "metadata": {
            "capacity_mbpd": 400,
            "global_refining_pct": 2.8,
            "recovery_time_days": 22,
        },
    },
    {
        "id": "energy_ras_laffan",
        "label": "Ras Laffan Port",
        "node_type": "energy_export",
        "country": "Qatar",
        "tags": ["energy", "lng", "export", "maritime"],
        "criticality": 0.90,
        "vulnerability": 0.64,
        "exposure": 0.86,
        "metadata": {
            "lng_capacity_mmtpa": 77,
            "global_lng_pct": 11.0,
            "port_depth_m": 18,
        },
    },
    {
        "id": "energy_ewp",
        "label": "East-West Pipelines System",
        "node_type": "energy_transmission",
        "country": "GCC",
        "tags": ["energy", "infrastructure", "pipelines", "distribution"],
        "criticality": 0.89,
        "vulnerability": 0.68,
        "exposure": 0.84,
        "metadata": {
            "total_capacity_mbpd": 600,
            "route_length_km": 1200,
            "countries": ["Saudi Arabia", "Qatar", "UAE"],
        },
    },
]

# Maritime and Trade nodes
MARITIME_NODES = [
    {
        "id": "maritime_hormuz",
        "label": "Strait of Hormuz",
        "node_type": "maritime_chokepoint",
        "country": "GCC",
        "tags": ["maritime", "energy", "trade", "chokepoint", "critical"],
        "criticality": 0.99,
        "vulnerability": 0.72,
        "exposure": 0.95,
        "metadata": {
            "daily_barrel_transit_mbpd": 21,
            "global_trade_pct": 20,
            "width_km": 54,
            "shipping_route": "Iran-Oman",
        },
    },
    {
        "id": "maritime_jebel_ali",
        "label": "Jebel Ali Port",
        "node_type": "maritime_port",
        "country": "UAE",
        "tags": ["maritime", "trade", "port", "uae", "tier1"],
        "criticality": 0.87,
        "vulnerability": 0.55,
        "exposure": 0.79,
        "metadata": {
            "annual_container_teu": 15_000_000,
            "global_port_rank": 12,
            "berths": 67,
        },
    },
]

# Financial and Macro nodes
FINANCIAL_NODES = [
    {
        "id": "financial_gcc_market",
        "label": "GCC Market Stress",
        "node_type": "financial_macro",
        "country": "GCC",
        "tags": ["financial", "macro", "markets", "sentiment"],
        "criticality": 0.85,
        "vulnerability": 0.70,
        "exposure": 0.80,
        "metadata": {
            "market_cap_usd_trillions": 1.2,
            "equity_indices": ["TASI", "DXB", "QSI"],
            "volatility_baseline": 0.15,
        },
    },
    {
        "id": "financial_liquidity",
        "label": "Liquidity Stress",
        "node_type": "financial_liquidity",
        "country": "GCC",
        "tags": ["financial", "liquidity", "banking", "credit"],
        "criticality": 0.86,
        "vulnerability": 0.68,
        "exposure": 0.78,
        "metadata": {
            "gcc_bank_deposits_usd_billions": 820,
            "lending_ratio": 0.88,
            "cross_border_share": 0.32,
        },
    },
    {
        "id": "financial_insurance",
        "label": "Insurance Repricing",
        "node_type": "financial_pricing",
        "country": "GCC",
        "tags": ["financial", "insurance", "pricing", "risk"],
        "criticality": 0.78,
        "vulnerability": 0.74,
        "exposure": 0.71,
        "metadata": {
            "gcc_insured_assets_usd_billions": 450,
            "coverage_gap_pct": 45,
            "premium_elasticity": 1.5,
        },
    },
]

# Utilities nodes
UTILITIES_NODES = [
    {
        "id": "utilities_electricity",
        "label": "Electricity Grid Stress",
        "node_type": "utilities_power",
        "country": "GCC",
        "tags": ["utilities", "electricity", "infrastructure", "demand"],
        "criticality": 0.88,
        "vulnerability": 0.61,
        "exposure": 0.81,
        "metadata": {
            "peak_demand_gw": 185,
            "oil_dependency_pct": 95,
            "reserve_margin_pct": 28,
        },
    },
    {
        "id": "utilities_water",
        "label": "Desalination/Water Stress",
        "node_type": "utilities_water",
        "country": "GCC",
        "tags": ["utilities", "water", "desalination", "critical"],
        "criticality": 0.89,
        "vulnerability": 0.65,
        "exposure": 0.83,
        "metadata": {
            "daily_capacity_billion_gallons": 4.5,
            "electricity_intensity_kwh_m3": 7.2,
            "per_capita_m3": 350,
        },
    },
    {
        "id": "utilities_telecom",
        "label": "Telecom Backbone Stress",
        "node_type": "utilities_telecom",
        "country": "GCC",
        "tags": ["utilities", "telecom", "infrastructure", "connectivity"],
        "criticality": 0.80,
        "vulnerability": 0.52,
        "exposure": 0.74,
        "metadata": {
            "internet_users_millions": 60,
            "undersea_cable_routes": 8,
            "redundancy_paths": 2,
        },
    },
]

# Social nodes
SOCIAL_NODES = [
    {
        "id": "social_rumor",
        "label": "Rumor Propagation",
        "node_type": "social_narrative",
        "country": "GCC",
        "tags": ["social", "narrative", "information", "sentiment"],
        "criticality": 0.72,
        "vulnerability": 0.82,
        "exposure": 0.69,
        "metadata": {
            "social_media_users_millions": 85,
            "viral_coefficient_baseline": 1.3,
            "fact_check_lag_hours": 6,
        },
    },
]

# Consolidated dict for easy access
ALL_STRATEGIC_NODES = {
    "energy": ENERGY_NODES,
    "maritime": MARITIME_NODES,
    "financial": FINANCIAL_NODES,
    "utilities": UTILITIES_NODES,
    "social": SOCIAL_NODES,
}


def flatten_strategic_nodes() -> list:
    """Flatten all strategic node groups into a single list."""
    result = []
    for nodes_list in ALL_STRATEGIC_NODES.values():
        result.extend(nodes_list)
    return result
