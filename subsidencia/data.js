// Mock Data: Subsidence Polygons (GeoJSON) - Representative for CDMX
const subsidenceData = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "Iztapalapa (Centro)", "rate": 38, "risk": "Critical" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-99.08, 19.34], [-99.05, 19.34], [-99.05, 19.37], [-99.08, 19.37], [-99.08, 19.34]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Zócalo / Centro Histórico", "rate": 25, "risk": "High" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-99.14, 19.42], [-99.12, 19.42], [-99.12, 19.44], [-99.14, 19.44], [-99.14, 19.42]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Aeropuerto (AICM)", "rate": 32, "risk": "Critical" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-99.09, 19.42], [-99.05, 19.42], [-99.05, 19.45], [-99.09, 19.45], [-99.09, 19.42]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Tláhuac", "rate": 29, "risk": "High" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-99.03, 19.28], [-98.99, 19.28], [-98.99, 19.31], [-99.03, 19.31], [-99.03, 19.28]
                ]]
            }
        }
    ]
};

// Exporting to window for simplicity in this demo
window.subsidenceGeoJSON = subsidenceData;
