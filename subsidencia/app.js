// Geovisualizador de Subsidencia CDMX - Multi-Instance Logic

document.addEventListener('DOMContentLoaded', () => {
    // 1. Map Initialization
    const mapElement = document.getElementById('map');
    if (mapElement) {
        window.map = L.map('map', { zoomControl: false }).setView([19.38, -99.13], 11);
        const map = window.map;
        const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'OSM' }).addTo(map);
        const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri' });

        const subsidenceLayer = L.layerGroup().addTo(map);

        const getStyle = (rate) => ({
            fillColor: rate > 30 ? '#dc2626' : rate > 15 ? '#f97316' : '#facc15',
            weight: 1, opacity: 1, color: '#003B5C', fillOpacity: 0.5
        });

        if (window.subsidenceGeoJSON) {
            L.geoJSON(window.subsidenceGeoJSON, { style: (f) => getStyle(f.properties.rate) }).addTo(subsidenceLayer);
        }
    }

    // 2. Tactic Dispatcher
    window.handleAction = (act) => {
        if (['polyline', 'polygon', 'circle'].includes(act)) startDraw(act);
        else if (act === 'sat') { if (map.hasLayer(sat)) map.removeLayer(sat); else sat.addTo(map); }
        else if (act === 'streets') map.removeLayer(sat);
        else if (['temporal', 'perfil'].includes(act)) openModal(act);
        else if (act === 'upload') document.getElementById('geoJSONUpload').click();
        else if (act === 'reset') location.reload();
    };

    const drawnItems = new L.FeatureGroup().addTo(map);
    window.startDraw = (type) => {
        let dr; const opts = { shapeOptions: { color: '#F1C400', weight: 4 } };
        if (type === 'polyline') dr = new L.Draw.Polyline(map, opts);
        else if (type === 'polygon') dr = new L.Draw.Polygon(map, opts);
        else if (type === 'circle') dr = new L.Draw.Circle(map, opts);
        if (dr) dr.enable();
    };

    map.on(L.Draw.Event.CREATED, (e) => {
        drawnItems.clearLayers(); drawnItems.addLayer(e.layer);
        if (e.layerType === 'polyline') {
            const data = analyzeLine(e.layer.toGeoJSON());
            window.openModal('perfil', data);
        }
    });

    // 3. Multi-Instance Analytics
    function analyzeLine(geojson) {
        if (!window.subsidenceGeoJSON) return;
        const line = geojson.geometry ? geojson : geojson.features[0];
        const len = turf.length(line, { units: 'kilometers' });
        const labels = []; const data = []; const steps = 25;
        for (let i = 0; i <= steps; i++) {
            const di = (len / steps) * i;
            const pt = turf.along(line, di, { units: 'kilometers' });
            let rate = 0;
            window.subsidenceGeoJSON.features.forEach(f => {
                if (turf.booleanPointInPolygon(pt, f)) rate = f.properties.rate;
            });
            labels.push(di.toFixed(1) + 'km');
            data.push(rate);
        }
        return { labels, data };
    }

    document.getElementById('geoJSONUpload').addEventListener('change', (e) => {
        const file = e.target.files[0]; const reader = new FileReader();
        reader.onload = (event) => {
            const geojson = JSON.parse(event.target.result);
            L.geoJSON(geojson, { style: { color: '#F1C400' } }).addTo(drawnItems);
            const data = analyzeLine(geojson);
            window.openModal('perfil', data);
        };
        reader.readAsText(file);
    });

    console.log("Motor Multi-Instancia v6.0 Operativo.");
});
