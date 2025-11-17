/**
 * Enhanced Main.js for Stock Analysis Platform
 * Integrates user behavior tracking, customer service assignment, and session management
 */

(function() {
  'use strict';

  // ==================== Configuration ====================
  const CONFIG = {
    API_BASE: '/app/maike/api',
    TRACKING_ENABLED: true,
    DEBUG_MODE: false,
    VISITOR_COUNT_BASE: 41978,
    VISITOR_COUNT_VARIANCE: 50
  };

  // ==================== Utility Functions ====================

  function log(...args) {
    if (CONFIG.DEBUG_MODE) {
      console.log('[StockAnalysis]', ...args);
    }
  }

  function generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `sess_${timestamp}_${random}`;
  }

  function getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem('session_id', sessionId);
      log('New session created:', sessionId);
    }
    return sessionId;
  }

  function getTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return 'UTC';
    }
  }

  function getLanguage() {
    return navigator.language || navigator.userLanguage || 'en';
  }

  function getOriginalReferrer() {
    let originalRef = sessionStorage.getItem('original_referrer');
    if (!originalRef && document.referrer) {
      originalRef = document.referrer;
      sessionStorage.setItem('original_referrer', originalRef);
      log('Original referrer stored:', originalRef);
    }
    return originalRef || '';
  }

  // ==================== API Functions ====================

  async function sendTrackingData(actionType, additionalData = {}) {
    if (!CONFIG.TRACKING_ENABLED) return;

    const trackingData = {
      session_id: getSessionId(),
      action_type: actionType,
      stock_name: localStorage.getItem('stock_name') || '',
      stock_code: localStorage.getItem('stockcode') || '',
      url: window.location.href,
      timestamp: new Date().toISOString(),
      ...additionalData
    };

    try {
      const response = await fetch(`${CONFIG.API_BASE}/info/page_track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'timezone': getTimezone(),
          'language': getLanguage()
        },
        body: JSON.stringify(trackingData)
      });

      if (response.ok) {
        log('Tracking data sent:', actionType, trackingData);
      }
    } catch (error) {
      log('Failed to send tracking data:', error);
      logError('tracking_error', error);
    }
  }

  async function logError(message, errorObj = {}) {
    try {
      const errorData = {
        message: message,
        stack: errorObj.stack || '',
        phase: 'runtime',
        stockcode: localStorage.getItem('stockcode') || '',
        href: window.location.href,
        ref: document.referrer,
        ts: Date.now()
      };

      await fetch(`${CONFIG.API_BASE}/info/logError`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      });
    } catch (e) {
      log('Failed to log error:', e);
    }
  }

  async function getCustomerServiceInfo() {
    try {
      const response = await fetch(`${CONFIG.API_BASE}/customerservice/get_info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'timezone': getTimezone(),
          'language': getLanguage()
        },
        body: JSON.stringify({
          stockcode: localStorage.getItem('stockcode') || '',
          text: localStorage.getItem('text') || '',
          original_ref: getOriginalReferrer()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      log('Customer service info received:', data);
      return data;
    } catch (error) {
      log('Failed to get customer service info:', error);
      logError('customer_service_api_error', error);
      throw error;
    }
  }

  // ==================== UI Functions ====================

  function animateVisitorCount() {
    const visitorCountEl = document.getElementById('visitor-count');
    if (!visitorCountEl) return;

    const baseCount = CONFIG.VISITOR_COUNT_BASE;
    const variance = CONFIG.VISITOR_COUNT_VARIANCE;

    function updateCount() {
      const randomOffset = Math.floor(Math.random() * variance * 2) - variance;
      const currentCount = baseCount + randomOffset;
      visitorCountEl.textContent = currentCount.toLocaleString();
    }

    updateCount();
    setInterval(updateCount, 8000 + Math.random() * 4000);
  }

  function removeLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
  }

  function animateProgressBars(progress, duration = 1500) {
    const bars = progress.filter(bar => bar);
    if (bars.length === 0) return;

    bars.forEach(bar => bar.style.width = '0%');

    let elapsed = 0;
    const interval = 30;

    const timer = setInterval(() => {
      elapsed += interval;
      const percent = Math.min(100, Math.round((elapsed / duration) * 100));

      if (bars[0]) bars[0].style.width = percent + '%';
      if (bars[1] && percent > 33) bars[1].style.width = ((percent - 33) * 1.5) + '%';
      if (bars[2] && percent > 66) bars[2].style.width = ((percent - 66) * 3) + '%';

      if (elapsed >= duration) {
        clearInterval(timer);
        bars.forEach(bar => bar.style.width = '100%');
      }
    }, interval);

    return new Promise(resolve => {
      setTimeout(resolve, duration + 200);
    });
  }

  // ==================== Cookie Banner ====================

  function initCookieBanner() {
    const acceptBtn = document.getElementById('cookie-accept');
    const banner = document.getElementById('cookie-banner');

    if (!acceptBtn || !banner) return;

    if (document.cookie.indexOf('cookieAccepted=true') !== -1) {
      banner.style.display = 'none';
      return;
    }

    acceptBtn.onclick = function() {
      banner.style.display = 'none';
      document.cookie = 'cookieAccepted=true; path=/; max-age=31536000';
    };
  }

  // ==================== Main Analysis Flow ====================

  async function handleAnalysisClick(btn, modal, progress, aiProgress, aiResult) {
    if (btn.disabled) return;

    const inputBox = document.getElementById('inputbox');
    const stockCode = inputBox ? inputBox.value.trim().toUpperCase() : '';

    if (!stockCode) {
      alert('Please enter a stock symbol');
      return;
    }

    localStorage.setItem('stockcode', stockCode);
    localStorage.setItem('text', stockCode);
    log('Stock code saved:', stockCode);

    const oldText = btn.textContent;
    btn.textContent = 'Analyzing...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    setTimeout(() => {
      btn.textContent = oldText;
      btn.disabled = false;
      btn.style.opacity = '';
    }, 1500);

    modal.style.display = 'block';
    aiProgress.style.display = 'block';
    aiResult.style.display = 'none';

    await animateProgressBars(progress, 1500);

    aiProgress.style.display = 'none';
    aiResult.style.display = 'block';

    const tipsCodeEl = document.getElementById('tips-code');
    if (tipsCodeEl) {
      tipsCodeEl.textContent = stockCode;
    }

    await sendTrackingData('popup_triggered', { stock_code: stockCode });
    log('Analysis completed for:', stockCode);
  }

  async function handleChatButtonClick() {
    try {
      await sendTrackingData('conversion', {
        action: 'chat_button_clicked',
        stock_code: localStorage.getItem('stockcode') || ''
      });

      gtag_report_conversion();

      const csInfo = await getCustomerServiceInfo();

      if (csInfo && csInfo.statusCode === 'ok') {
        log('Redirecting to jpint with customer service info');
        window.location.href = '/jpint';
      } else {
        throw new Error('Failed to get customer service info');
      }
    } catch (error) {
      log('Error in chat button handler:', error);

      if (window.globalLink) {
        log('Using fallback global link');
        window.location.href = window.globalLink;
      } else {
        alert('Service temporarily unavailable. Please try again later.');
      }
    }
  }

  // ==================== Initialization ====================

  async function initializePage() {
    try {
      log('Initializing page...');

      getOriginalReferrer();

      await sendTrackingData('page_load', {
        page: 'home',
        referrer: document.referrer
      });

      initCookieBanner();
      animateVisitorCount();

      const btn = document.querySelector('.btn');
      const modal = document.getElementById('ai-modal');
      const progress = [
        document.getElementById('bar-1'),
        document.getElementById('bar-2'),
        document.getElementById('bar-3')
      ];
      const aiProgress = document.getElementById('ai-progress');
      const aiResult = document.getElementById('ai-result');
      const chatBtn = document.getElementById('chat-btn');

      if (!btn || !modal || !aiProgress || !aiResult || !chatBtn) {
        log('Warning: Required DOM elements not found');
        return;
      }

      btn.addEventListener('click', () => {
        handleAnalysisClick(btn, modal, progress, aiProgress, aiResult);
      });

      chatBtn.addEventListener('click', handleChatButtonClick);

      try {
        const response = await fetch('/api/get-links');
        if (response.ok) {
          const data = await response.json();
          const redirectUrl = data.data?.[0]?.redirectUrl;
          if (redirectUrl) {
            window.globalLink = redirectUrl;
            log('Global link loaded:', redirectUrl);
            removeLoadingOverlay();
          }
        }
      } catch (error) {
        log('Failed to load global link:', error);
        removeLoadingOverlay();
      }

      log('Page initialization complete');
    } catch (error) {
      log('Error during initialization:', error);
      logError('initialization_error', error);
    }
  }

  // ==================== Global Error Handler ====================

  window.addEventListener('error', function(event) {
    logError('uncaught_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack || ''
    });
  });

  window.addEventListener('unhandledrejection', function(event) {
    logError('unhandled_promise_rejection', {
      message: event.reason?.message || 'Promise rejection',
      stack: event.reason?.stack || ''
    });
  });

  // ==================== Start Application ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
  } else {
    initializePage();
  }

})();
