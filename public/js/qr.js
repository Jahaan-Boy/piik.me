// QR Code generation and handling
function generateQRCode(url, validityDays) {
    const qrExpiry = new Date();
    qrExpiry.setDate(qrExpiry.getDate() + validityDays);
    
    return {
        url,
        validUntil: qrExpiry.toISOString(),
        createdAt: new Date().toISOString()
    };
}

// Function to check QR validity
function isQRValid(qrData) {
    if (!qrData || !qrData.validUntil) return false;
    const now = new Date();
    const validUntil = new Date(qrData.validUntil);
    return now <= validUntil;
}

// Show toast notification
function showToast(message, icon = '✅') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    // Add to document
    document.body.appendChild(toast);

    // Remove after animation
    setTimeout(() => {
        toast.remove();
    }, 3000);
}