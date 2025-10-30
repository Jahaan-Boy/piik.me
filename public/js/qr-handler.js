// QR Code DOM Elements
const viewQrBtn = document.getElementById('viewQrBtn');
const qrCodeSection = document.getElementById('qrCodeSection');
const qrCodeImage = document.getElementById('qrCodeImage');
const downloadQrBtn = document.getElementById('downloadQrBtn');

let currentQrData = null;

// Event listeners for QR code buttons
if (viewQrBtn) viewQrBtn.addEventListener('click', toggleQrCode);
if (downloadQrBtn) downloadQrBtn.addEventListener('click', downloadQrCode);

// Toggle QR code display
function toggleQrCode() {
    if (!currentQrData) {
        showToast('No QR code available for this link', '❌');
        return;
    }

    const isVisible = qrCodeSection.style.display !== 'none';
    qrCodeSection.style.display = isVisible ? 'none' : 'block';
    viewQrBtn.textContent = isVisible ? '📱 View QR Code' : '📱 Hide QR Code';
}

// Display QR code
function displayQrCode(qrData) {
    currentQrData = qrData;
    if (qrData && qrData.qrDataUrl) {
        qrCodeImage.src = qrData.qrDataUrl;
        viewQrBtn.style.display = 'inline-flex';
    } else {
        viewQrBtn.style.display = 'none';
    }
}

// Download QR code
function downloadQrCode() {
    if (!currentQrData || !currentQrData.qrDataUrl) {
        showToast('No QR code available to download', '❌');
        return;
    }

    const link = document.createElement('a');
    link.download = 'zaplink-qr.png';
    link.href = currentQrData.qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('QR code downloaded! 📱');
}

// Update createShortLink response handler
function handleShortLinkCreated(data) {
    if (data.success) {
        currentShortCode = data.shortCode;
        resultSection.style.display = 'block';
        shortUrlDisplay.value = data.shortUrl;
        
        // Display QR code if available
        displayQrCode(data.qrCodeData);
        
        // Show success message
        showToast('Link created successfully! 🚀');
    }
}

// Expose functions
window.toggleQrCode = toggleQrCode;
window.downloadQrCode = downloadQrCode;