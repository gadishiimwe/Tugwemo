// ===========================
// ✅ Tugwemo Ad Manager
// ===========================

// Set your backend API base URL (important for Vercel + Render setup)
const BACKEND_URL = "https://tugwemo-backend.onrender.com"; // change if backend name differs

let currentAds = [];
let waitingAdBanner, chatAdBanner;
let waitingAdCloseBtn, chatAdCloseBtn;
let waitingAdImage, waitingAdTitle, waitingAdContent;
let chatAdImage, chatAdTitle, chatAdContent;

// Initialize all ad elements
function initializeAds() {
  waitingAdBanner = document.getElementById('waiting-ad-banner');
  chatAdBanner = document.getElementById('chat-ad-banner');
  waitingAdCloseBtn = document.getElementById('waiting-ad-close');
  chatAdCloseBtn = document.getElementById('chat-ad-close');
  waitingAdImage = document.getElementById('waiting-ad-image');
  waitingAdTitle = document.getElementById('waiting-ad-title');
  waitingAdContent = document.getElementById('waiting-ad-content');
  chatAdImage = document.getElementById('chat-ad-image');
  chatAdTitle = document.getElementById('chat-ad-title');
  chatAdContent = document.getElementById('chat-ad-content');

  console.log('✅ AdManager initialized');

  // Close button events
  waitingAdCloseBtn?.addEventListener('click', e => {
    e.stopPropagation();
    hideWaitingAd();
  });

  chatAdCloseBtn?.addEventListener('click', e => {
    e.stopPropagation();
    hideChatAd();
  });

  // Click events for ads
  waitingAdBanner?.addEventListener('click', () => handleAdClick(currentAds[0]));
  chatAdBanner?.addEventListener('click', () => handleAdClick(currentAds[1] || currentAds[0]));
}

// Fetch ads from backend API
async function fetchAds() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/ads`);
    const data = await response.json();
    currentAds = data.ads || [];
    console.log('✅ Ads fetched:', currentAds.length);
    return currentAds;
  } catch (error) {
    console.error('❌ Failed to fetch ads:', error);
    return [];
  }
}

// Display ad while waiting
function showWaitingAd(ad) {
  if (!waitingAdBanner || !ad) return;
  waitingAdImage.src = ad.imageUrl || '';
  waitingAdTitle.textContent = ad.title || '';
  waitingAdContent.textContent = ad.content || '';
  waitingAdBanner.style.display = 'block';
}

// Hide waiting ad
function hideWaitingAd() {
  if (waitingAdBanner) waitingAdBanner.style.display = 'none';
}

// Display ad during chat
function showChatAd(ad) {
  if (!chatAdBanner || !ad) return;
  chatAdImage.src = ad.imageUrl || '';
  chatAdTitle.textContent = ad.title || '';
  chatAdContent.textContent = ad.content || '';
  chatAdBanner.style.display = 'block';
}

// Hide chat ad
function hideChatAd() {
  if (chatAdBanner) chatAdBanner.style.display = 'none';
}

// Handle ad click
async function handleAdClick(ad) {
  if (!ad) return;
  try {
    await fetch(`${BACKEND_URL}/api/auth/ads/${ad._id}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (ad.targetUrl) window.open(ad.targetUrl, '_blank');
  } catch (error) {
    console.error('❌ Error tracking ad click:', error);
    if (ad.targetUrl) window.open(ad.targetUrl, '_blank');
  }
}

// Export globally
window.AdManager = {
  initializeAds,
  fetchAds,
  showWaitingAd,
  hideWaitingAd,
  showChatAd,
  hideChatAd,
  currentAds
};

// Initialize after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initializeAds();
});
