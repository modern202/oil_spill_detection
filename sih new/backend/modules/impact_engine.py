"""
Oil Spill Source Attribution System - Institutional & Social Impact Engine
Calculates Cleanup Cost, Ecological Sensitivity, Fisherfolk Impact, and Multi-language Coastal Alerts
"""

import math
from typing import Dict, Any, List

class ImpactEngine:
    def __init__(self):
        # Protected ecological marine zones across Indian waters & Indo-Pacific
        self.ecological_reserves = [
            {
                "id": "sundarbans_mangrove",
                "name": "Sundarbans UNESCO Biosphere & Mangrove Sanctuary",
                "state": "West Bengal, India",
                "lat": 21.9497,
                "lon": 88.9000,
                "radius_km": 45.0,
                "ecosystem_type": "Mangrove / Royal Bengal Tiger & Gangetic Dolphin Habitat",
                "vulnerability_level": "CRITICAL",
                "species_at_risk": ["Royal Bengal Tiger", "Irrawaddy Dolphin", "Estuarine Crocodile", "Mudskippers"]
            },
            {
                "id": "gahirmatha_turtles",
                "name": "Gahirmatha Marine Sanctuary & Olive Ridley Rookery",
                "state": "Odisha, India",
                "lat": 20.7167,
                "lon": 87.0500,
                "radius_km": 30.0,
                "ecosystem_type": "Turtle Mass Nesting & Marine Sanctuary",
                "vulnerability_level": "CRITICAL",
                "species_at_risk": ["Olive Ridley Sea Turtle", "Horseshoe Crab", "Hilsa Shad"]
            },
            {
                "id": "gulf_of_mannar_coral",
                "name": "Gulf of Mannar Coral Biosphere Reserve",
                "state": "Tamil Nadu, India",
                "lat": 9.1200,
                "lon": 79.1500,
                "radius_km": 35.0,
                "ecosystem_type": "Coral Reefs & Seagrass Beds",
                "vulnerability_level": "CRITICAL",
                "species_at_risk": ["Dugong (Sea Cow)", "Acropora Coral", "Green Sea Turtle", "Sea Cucumbers"]
            },
            {
                "id": "mumbai_coastal_wetlands",
                "name": "Thane Creek Flamingo & Coastal Marine Zone",
                "state": "Maharashtra, India",
                "lat": 18.9600,
                "lon": 72.8200,
                "radius_km": 25.0,
                "ecosystem_type": "Intertidal Mudflats & Coastal Fishery",
                "vulnerability_level": "HIGH",
                "species_at_risk": ["Lesser Flamingo", "Bombay Duck Fish", "Mangrove Crabs"]
            }
        ]

    def estimate_cleanup_cost(
        self,
        spill_area_km2: float,
        oil_volume_tonnes: float,
        oil_type: str = "Heavy Crude Oil"
    ) -> Dict[str, Any]:
        """
        Calculates containment, skimming, dispersant, and disposal costs
        based on ITOPF / US EPA cleanup cost benchmark curves.
        USD to INR rate used: 1 USD = 86.5 INR.
        """
        USD_TO_INR = 86.5

        # Base cost per tonne depends on oil density and persistence
        rate_per_tonne = 4800.0  # USD / tonne for heavy fuel / crude
        if "Diesel" in oil_type or "Light" in oil_type:
            rate_per_tonne = 2800.0

        # Tiered cost breakdown
        containment_boom_meters = min(25000, max(500, spill_area_km2 * 450.0))
        boom_deployment_cost_usd = containment_boom_meters * 42.0

        skimming_vessel_days = max(2, int(oil_volume_tonnes / 8.0))
        skimming_ops_cost_usd = skimming_vessel_days * 18500.0

        dispersant_liters = max(500, oil_volume_tonnes * 45.0)
        dispersant_cost_usd = dispersant_liters * 12.5

        shoreline_cleanup_usd = spill_area_km2 * 12500.0
        hazardous_waste_disposal_usd = oil_volume_tonnes * 1450.0

        subtotal_usd = (
            boom_deployment_cost_usd +
            skimming_ops_cost_usd +
            dispersant_cost_usd +
            shoreline_cleanup_usd +
            hazardous_waste_disposal_usd
        )
        contingency_usd = subtotal_usd * 0.15
        total_cost_usd = subtotal_usd + contingency_usd
        total_cost_inr_crores = (total_cost_usd * USD_TO_INR) / 1e7

        return {
            "currency": "USD / INR",
            "spill_area_km2": round(spill_area_km2, 2),
            "oil_volume_tonnes": round(oil_volume_tonnes, 1),
            "oil_type": oil_type,
            "cost_breakdown": {
                "containment_booming_usd": round(boom_deployment_cost_usd, 0),
                "boom_length_required_m": round(containment_boom_meters, 0),
                "skimmer_vessel_operations_usd": round(skimming_ops_cost_usd, 0),
                "operational_duration_days": skimming_vessel_days,
                "chemical_dispersant_usd": round(dispersant_cost_usd, 0),
                "dispersant_volume_liters": round(dispersant_liters, 0),
                "shoreline_protection_usd": round(shoreline_cleanup_usd, 0),
                "hazardous_waste_disposal_usd": round(hazardous_waste_disposal_usd, 0),
                "contingency_and_logistics_usd": round(contingency_usd, 0)
            },
            "total_estimated_cost_usd": round(total_cost_usd, 0),
            "total_estimated_cost_inr_crores": round(total_cost_inr_crores, 2),
            "response_tier": "Tier 2 (Regional Response)" if total_cost_usd < 2500000 else "Tier 3 (National Disaster Response)"
        }

    def assess_ecological_impact(
        self,
        spill_lat: float,
        spill_lon: float,
        forecast_path: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Assesses proximity and trajectory intersection with protected marine parks.
        """
        from .ais_engine import haversine_distance_km

        threatened_zones = []
        overall_eco_risk = "LOW"

        for eco in self.ecological_reserves:
            # Check distance to current spill
            dist_current = haversine_distance_km(spill_lat, spill_lon, eco["lat"], eco["lon"])
            
            # Check min distance along forecast path
            min_forecast_dist = dist_current
            time_to_impact_hours = 0.0
            for wp in forecast_path:
                d = haversine_distance_km(wp["lat"], wp["lon"], eco["lat"], eco["lon"])
                if d < min_forecast_dist:
                    min_forecast_dist = d
                    time_to_impact_hours = wp["hours_ahead"]

            is_direct_hit = min_forecast_dist <= eco["radius_km"]
            is_nearby = min_forecast_dist <= (eco["radius_km"] + 25.0)

            if is_direct_hit or is_nearby:
                threat_level = "CRITICAL DIRECT THREAT" if is_direct_hit else "HIGH WATCH"
                threatened_zones.append({
                    "zone_id": eco["id"],
                    "name": eco["name"],
                    "state": eco["state"],
                    "ecosystem_type": eco["ecosystem_type"],
                    "distance_km": round(min_forecast_dist, 1),
                    "time_to_impact_hours": round(time_to_impact_hours, 1) if is_direct_hit else None,
                    "threat_level": threat_level,
                    "species_at_risk": eco["species_at_risk"],
                    "polygon_centroid": {"lat": eco["lat"], "lon": eco["lon"]}
                })
                overall_eco_risk = "CRITICAL" if is_direct_hit else "HIGH"

        return {
            "overall_ecological_risk": overall_eco_risk,
            "threatened_marine_parks": threatened_zones,
            "immediate_action_recommendation": "Deploy defensive containment booms around tidal creeks and mangrove fringe within 6 hours." if threatened_zones else "Monitor forward drift trajectory via hourly satellite passes."
        }

    def calculate_fisherfolk_impact(
        self,
        spill_area_km2: float,
        coastal_region: str = "Odisha - West Bengal Coast"
    ) -> Dict[str, Any]:
        """
        Calculates economic damage and livelihood interruption for local fishing communities.
        """
        # Fishery exclusion zone (spill area + 5 km security buffer)
        buffer_radius_km = math.sqrt(spill_area_km2 / math.pi) + 5.0
        exclusion_zone_km2 = math.pi * (buffer_radius_km ** 2)

        # Average fishing vessel density along Indian EEZ: ~1.2 motorized/traditional boats per 10 km2
        affected_boats = max(8, int(exclusion_zone_km2 * 0.12))
        avg_crew_per_boat = 4
        affected_fisherfolk = affected_boats * avg_crew_per_boat

        closure_days = 14  # estimated fishing ban duration
        daily_loss_per_boat_inr = 4500.0
        total_boat_loss_inr = affected_boats * daily_loss_per_boat_inr * closure_days
        catch_contamination_loss_inr = affected_boats * 35000.0

        total_compensation_inr = total_boat_loss_inr + catch_contamination_loss_inr
        total_compensation_crores = total_compensation_inr / 1e7

        return {
            "region": coastal_region,
            "exclusion_zone_area_km2": round(exclusion_zone_km2, 1),
            "estimated_affected_vessels": affected_boats,
            "affected_active_fisherfolk": affected_fisherfolk,
            "recommended_closure_duration_days": closure_days,
            "total_estimated_livelihood_loss_inr": round(total_compensation_inr, 0),
            "total_compensation_crores": round(total_compensation_crores, 2),
            "relief_scheme_recommendation": "Emergency Maritime Relief Fund direct DBT transfer of ₹15,000 per affected crew member."
        }

    def generate_multilingual_alerts(
        self,
        spill_location_name: str,
        exclusion_radius_km: float,
        timestamp_str: str
    ) -> Dict[str, Dict[str, str]]:
        """
        Generates regional language coastal warning broadcasts (English, Hindi, Bengali, Odia, Tamil).
        """
        return {
            "english": {
                "language": "English",
                "headline": f"URGENT MARITIME ADVISORY: Oil Slick Detected Near {spill_location_name}",
                "body": f"The Indian Coast Guard & Marine Authority has detected an active oil spill near {spill_location_name}. An exclusion radius of {exclusion_radius_km:.1f} km is in effect. All artisanal and mechanized fishing craft must avoid this zone immediately to prevent net contamination and toxic vapor exposure.",
                "sms_short": f"ALERT: Oil spill near {spill_location_name}. Stay {exclusion_radius_km:.0f}km away. Avoid fishing in marked zone. - Coast Guard Control"
            },
            "hindi": {
                "language": "हिंदी (Hindi)",
                "headline": f"आपातकालीन समुद्री चेतावनी: {spill_location_name} के पास तेल रिसाव की पुष्टि",
                "body": f"भारतीय तटरक्षक बल ने {spill_location_name} के पास समुद्री तेल रिसाव का पता लगाया है। {exclusion_radius_km:.1f} किमी के दायरे में मछली पकड़ने पर तुरंत रोक लगा दी गई है। सभी मछुआरों से अनुरोध है कि वे इस क्षेत्र में जाने से बचें।",
                "sms_short": f"सावधान: {spill_location_name} के पास तेल रिसाव। {exclusion_radius_km:.0f} किमी दूर रहें। मछली पकड़ना प्रतिबंधित है।"
            },
            "bengali": {
                "language": "বাংলা (Bengali)",
                "headline": f"জরুরি উপকূলীয় সতর্কতা: {spill_location_name}-এর কাছে তেল নিঃসরণ শনাক্ত",
                "body": f"উপকূলরক্ষী বাহিনী {spill_location_name}-এর নিকটবর্তী সমুদ্রে বিপজ্জনক তেল নিঃসরণ লক্ষ্য করেছে। {exclusion_radius_km:.1f} কিমি এলাকাকে নিষিদ্ধ এলাকা হিসেবে ঘোষণা করা হয়েছে। সমস্ত মৎস্যজীবীদের অবিলম্বে এই এলাকা এড়িয়ে চলার নির্দেশ দেওয়া হচ্ছে।",
                "sms_short": f"সতর্কতা: {spill_location_name}-এর কাছে তেল ভাসছে। {exclusion_radius_km:.0f} কিমি দূরত্ব বজায় রাখুন। জাল ফেলবেন না।"
            },
            "odia": {
                "language": "ଓଡ଼ିଆ (Odia)",
                "headline": f"ଜରୁରୀ ସାମୁଦ୍ରିକ ସତର୍କତା: {spill_location_name} ନିକଟରେ ତୈଳ ନିର୍ଗମନ ସୂଚନା",
                "body": f"ଭାରତୀୟ ତଟରକ୍ଷୀ ବାହିନୀ ଦ୍ୱାରା {spill_location_name} ନିକଟରେ ତେଲ ବୋହିବା ଚିହ୍ନଟ କରାଯାଇଛି। {exclusion_radius_km:.1f} କିମି ପରିଧି ମଧ୍ୟରେ ମାଛ ଧରିବାକୁ ସମ୍ପୂର୍ଣ୍ଣ ନିଷେଧ କରାଯାଇଛି। ମତ୍ସ୍ୟଜୀବୀମାନେ ତୁରନ୍ତ ସୁରକ୍ଷିତ ସ୍ଥାନକୁ ଫେରିଆସନ୍ତୁ।",
                "sms_short": f"ସତର୍କତା: {spill_location_name} ନିକଟରେ ତେଲ ଢଳିଛି। {exclusion_radius_km:.0f} କିମି ଦୂରରେ ରୁହନ୍ତୁ। ତୁରନ୍ତ ଫେରିଆସନ୍ତୁ।"
            },
            "tamil": {
                "language": "தமிழ் (Tamil)",
                "headline": f"அவசர கடல்சார் எச்சரிக்கை: {spill_location_name} அருகே எண்ணெய் கசிவு கண்டறியப்பட்டது",
                "body": f"இந்திய கடலோரக் காவல் படை {spill_location_name} அருகே கடல் எண்ணெய் கசிவை உறுதி செய்துள்ளது. {exclusion_radius_km:.1f} கி.மீ பரப்பளவுக்குள் மீன்பிடிக்க தடை விதிக்கப்பட்டுள்ளது. அனைத்து மீனவர்களும் இந்த பகுதியை உடனடியாக தவிர்க்கவும்.",
                "sms_short": f"எச்சரிக்கை: {spill_location_name} அருகே எண்ணெய் கசிவு. {exclusion_radius_km:.0f} கிமீ தள்ளி இருக்கவும். கடலுக்கு செல்ல வேண்டாம்."
            }
        }
