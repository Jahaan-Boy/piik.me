// Handle analytics filter change
function handleAnalyticsFilter() {
    currentAnalyticsFilter = analyticsFilter.value;
    if (currentShortCode) {
        loadAnalytics(currentShortCode);
    }
}

// Filter analytics based on type
function filterAnalytics(analytics) {
    if (currentAnalyticsFilter === 'all') return analytics;

    const filtered = {
        ...analytics,
        clicks: 0,
        impressions: 0,
        shares: 0,
        clickHistory: [],
        devices: {},
        browsers: {},
        referrers: {}
    };

    // Helper function to check if a click is from QR or UTM
    const isQRClick = (click) => click.source === 'qr';
    const isUTMClick = (click) => click.utmParams && Object.keys(click.utmParams).length > 0;

    // Filter click history based on selected type
    analytics.clickHistory.forEach(click => {
        const shouldInclude = 
            (currentAnalyticsFilter === 'qr' && isQRClick(click)) ||
            (currentAnalyticsFilter === 'utm' && isUTMClick(click));

        if (shouldInclude) {
            filtered.clicks++;
            filtered.clickHistory.push(click);

            // Update aggregated stats
            if (click.device) {
                filtered.devices[click.device] = (filtered.devices[click.device] || 0) + 1;
            }
            if (click.browser) {
                filtered.browsers[click.browser] = (filtered.browsers[click.browser] || 0) + 1;
            }
            if (click.referrer) {
                filtered.referrers[click.referrer] = (filtered.referrers[click.referrer] || 0) + 1;
            }
        }
    });

    // Calculate impressions based on filtered clicks
    filtered.impressions = analytics.impressions;
    
    return filtered;
}

// Generate QR Code
async function generateQRCode(url, validityDays) {
    const qrExpiry = new Date();
    qrExpiry.setDate(qrExpiry.getDate() + validityDays);
    
    const qrCodeUrl = url + (url.includes('?') ? '&' : '?') + 'source=qr';
    
    // Generate QR code data URL
    const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 200
    });
    
    return {
        url: qrCodeUrl,
        validUntil: qrExpiry.toISOString(),
        createdAt: new Date().toISOString(),
        qrDataUrl
    };
}

// Update the load analytics function to use filtering
async function loadAnalytics(shortCode) {
    try {
        const response = await fetch(`/api/analytics/${shortCode}`);
        const data = await response.json();

        if (data.link && data.analytics) {
            displayLinkInfo(data.link);
            const filteredAnalytics = filterAnalytics(data.analytics);
            updateAnalyticsDisplay(filteredAnalytics);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        showToast('Failed to load analytics', '❌');
    }
}