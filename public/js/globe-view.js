// ================================
// GLOBE VIEW - 3D Interactive Visualization
// ================================

let globeInstance = null;
let globeData = [];
let isRotating = false;
let currentGeoView = 'details';

// Geocoding cache for city coordinates
const cityCoordinates = {};

// Function to get coordinates from city name using a free geocoding API
async function getCoordinates(city, region, country) {
    const cacheKey = `${city}, ${region}, ${country}`;
    
    // Check cache first
    if (cityCoordinates[cacheKey]) {
        return cityCoordinates[cacheKey];
    }
    
    try {
        // Use Nominatim (OpenStreetMap) for free geocoding
        const query = encodeURIComponent(`${city}, ${region}, ${country}`);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
        
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                const coords = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
                
                // Cache the result
                cityCoordinates[cacheKey] = coords;
                return coords;
            }
        }
    } catch (error) {
        console.log('Geocoding error:', error);
    }
    
    // Fallback to approximate coordinates based on country
    return getCountryApproximateCoords(country);
}

// Approximate coordinates for major countries (fallback)
function getCountryApproximateCoords(country) {
    const countryCoords = {
        'India': { lat: 20.5937, lng: 78.9629 },
        'United States': { lat: 37.0902, lng: -95.7129 },
        'United Kingdom': { lat: 55.3781, lng: -3.4360 },
        'Canada': { lat: 56.1304, lng: -106.3468 },
        'Australia': { lat: -25.2744, lng: 133.7751 },
        'Germany': { lat: 51.1657, lng: 10.4515 },
        'France': { lat: 46.2276, lng: 2.2137 },
        'Netherlands': { lat: 52.1326, lng: 5.2913 },
        'Russia': { lat: 61.5240, lng: 105.3188 },
        'China': { lat: 35.8617, lng: 104.1954 },
        'Japan': { lat: 36.2048, lng: 138.2529 },
        'Brazil': { lat: -14.2350, lng: -51.9253 },
        'Unknown': { lat: 0, lng: 0 }
    };
    
    return countryCoords[country] || { lat: 0, lng: 0 };
}

// Switch between globe and table view
function switchGeoView(view) {
    currentGeoView = view;
    
    const globeContainer = document.getElementById('globeViewContainer');
    const detailsContainer = document.getElementById('clickDetailsContainer');
    const globeViewBtn = document.getElementById('globeViewBtn');
    const clickDetailsViewBtn = document.getElementById('clickDetailsViewBtn');
    
    if (view === 'globe') {
        globeContainer.style.display = 'block';
        detailsContainer.style.display = 'none';
        globeViewBtn.classList.add('active');
        clickDetailsViewBtn.classList.remove('active');
        
        // Initialize or update globe
        if (!globeInstance) {
            initializeGlobe();
        } else {
            updateGlobeData();
        }
    } else {
        globeContainer.style.display = 'none';
        detailsContainer.style.display = 'block';
        globeViewBtn.classList.remove('active');
        clickDetailsViewBtn.classList.add('active');
    }
}

// Initialize the 3D globe
async function initializeGlobe() {
    const container = document.getElementById('globeViz');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Create globe instance
    globeInstance = Globe()
        (container)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .pointsData([])
        .pointAltitude(0.01)
        .pointColor(() => '#00ffaa')
        .pointRadius(0.4)
        .pointLabel(d => `
            <div style="background: rgba(0, 0, 0, 0.9); padding: 12px; border-radius: 8px; color: white; font-family: 'Inter', sans-serif;">
                <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${d.city}, ${d.region}</div>
                <div style="font-size: 12px; color: #aaa;">${d.country}</div>
                <div style="font-size: 16px; font-weight: 700; color: #00ffaa; margin-top: 6px;">${d.clicks} click${d.clicks > 1 ? 's' : ''}</div>
            </div>
        `)
        .arcsData([])
        .arcColor(() => 'rgba(0, 255, 170, 0.4)')
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(4000)
        .arcStroke(0.5)
        .atmosphereColor('#00ffaa')
        .atmosphereAltitude(0.15);
    
    // Set initial view
    globeInstance.pointOfView({ altitude: 2.5 });
    
    // Update with actual data
    await updateGlobeData();
}

// Update globe with click data
async function updateGlobeData() {
    if (!globeInstance || !allGeoClicks) return;
    
    // Aggregate clicks by location
    const locationMap = {};
    
    for (const click of allGeoClicks) {
        if (!click.location) continue;
        
        const key = `${click.location.city}, ${click.location.region}, ${click.location.country}`;
        
        if (!locationMap[key]) {
            locationMap[key] = {
                city: click.location.city,
                region: click.location.region,
                country: click.location.country,
                clicks: 0,
                coords: null
            };
        }
        
        locationMap[key].clicks++;
    }
    
    // Get coordinates for each location
    const locations = Object.values(locationMap);
    const pointsData = [];
    
    for (const loc of locations) {
        const coords = await getCoordinates(loc.city, loc.region, loc.country);
        
        if (coords && coords.lat !== 0 && coords.lng !== 0) {
            pointsData.push({
                lat: coords.lat,
                lng: coords.lng,
                city: loc.city,
                region: loc.region,
                country: loc.country,
                clicks: loc.clicks,
                size: Math.min(loc.clicks * 0.3, 2)
            });
        }
    }
    
    // Update globe with points
    globeInstance
        .pointsData(pointsData)
        .pointRadius(d => d.size);
    
    // Update locations list
    updateGlobeLocationsList(pointsData);
    
    // Auto-rotate
    if (!isRotating) {
        startGlobeRotation();
    }
}

// Update the locations list below the globe
function updateGlobeLocationsList(points) {
    const container = document.getElementById('globeLocationsList');
    if (!container) return;
    
    // Sort by clicks (descending)
    points.sort((a, b) => b.clicks - a.clicks);
    
    container.innerHTML = points.map((point, index) => `
        <div class="globe-location-item" onclick="focusOnLocation(${point.lat}, ${point.lng})">
            <div class="location-marker" style="background: #00ffaa;"></div>
            <div class="location-info">
                <div class="location-name">${point.city}, ${point.region}</div>
                <div class="location-country">${point.country}</div>
            </div>
            <div class="location-clicks">${point.clicks}</div>
        </div>
    `).join('');
}

// Focus globe on specific location
function focusOnLocation(lat, lng) {
    if (!globeInstance) return;
    
    globeInstance.pointOfView({
        lat: lat,
        lng: lng,
        altitude: 1.5
    }, 1000);
}

// Reset globe view
function resetGlobeView() {
    if (!globeInstance) return;
    
    globeInstance.pointOfView({
        lat: 0,
        lng: 0,
        altitude: 2.5
    }, 1000);
}

// Toggle auto-rotation
function toggleGlobeRotation() {
    if (isRotating) {
        stopGlobeRotation();
    } else {
        startGlobeRotation();
    }
}

let rotationAnimation = null;

function startGlobeRotation() {
    if (!globeInstance) return;
    
    isRotating = true;
    const rotationIcon = document.getElementById('rotationIcon');
    const rotationText = document.getElementById('rotationText');
    
    if (rotationIcon) rotationIcon.classList.add('fa-spin');
    if (rotationText) rotationText.textContent = 'Stop Rotation';
    
    // Rotate globe
    let angle = 0;
    rotationAnimation = setInterval(() => {
        angle += 0.3;
        const pov = globeInstance.pointOfView();
        globeInstance.pointOfView({
            lat: pov.lat,
            lng: angle,
            altitude: pov.altitude
        });
    }, 50);
}

function stopGlobeRotation() {
    isRotating = false;
    const rotationIcon = document.getElementById('rotationIcon');
    const rotationText = document.getElementById('rotationText');
    
    if (rotationIcon) rotationIcon.classList.remove('fa-spin');
    if (rotationText) rotationText.textContent = 'Auto-Rotate';
    
    if (rotationAnimation) {
        clearInterval(rotationAnimation);
        rotationAnimation = null;
    }
}

// Initialize when window loads
window.addEventListener('load', () => {
    console.log('Globe.gl library loaded');
});
