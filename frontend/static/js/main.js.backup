document.addEventListener("DOMContentLoaded", async function () {
  var acceptBtn = document.getElementById("cookie-accept");
  var banner = document.getElementById("cookie-banner");
  if (!acceptBtn || !banner) return;
  acceptBtn.onclick = function () {
    banner.style.display = "none";
    document.cookie = "cookieAccepted=true; path=/; max-age=31536000";
  };
  if (document.cookie.indexOf("cookieAccepted=true") !== -1) {
    banner.style.display = "none";
  }

  var btn = document.querySelector(".btn");
  var modal = document.getElementById("ai-modal");
  var progress = [
    document.getElementById("bar-1"),
    document.getElementById("bar-2"),
    document.getElementById("bar-3"),
  ];
  var aiProgress = document.getElementById("ai-progress");
  var aiResult = document.getElementById("ai-result");
  var chatBtn = document.getElementById("chat-btn");

  function removeLoadingOverlay() {
    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.style.display = "none";
    }
  }

  if (
    btn &&
    modal &&
    progress[0] &&
    progress[1] &&
    progress[2] &&
    aiProgress &&
    aiResult &&
    chatBtn
  ) {
    btn.addEventListener("click", async function () {
      if (btn.disabled) return;

      const inputBox = document.getElementById('inputbox');
      const stockCode = inputBox ? inputBox.value.trim().toUpperCase() : '';

      if (!stockCode) {
        alert('Please enter a stock symbol');
        return;
      }

      var oldText = btn.textContent;
      btn.textContent = "Analyzing...";
      btn.disabled = true;
      btn.style.opacity = "0.7";
      setTimeout(function () {
        btn.textContent = oldText;
        btn.disabled = false;
        btn.style.opacity = "";
      }, 1500);

      modal.style.display = "block";
      aiProgress.style.display = "block";
      aiResult.style.display = "none";
      progress.forEach(function (bar) {
        bar.style.width = "0%";
      });
      var t = 0,
        interval = 30,
        duration = 1500;
      var timer = setInterval(function () {
        t += interval;
        var percent = Math.min(100, Math.round((t / duration) * 100));
        progress[0].style.width = percent + "%";
        if (percent > 33) progress[1].style.width = (percent - 33) * 1.5 + "%";
        if (percent > 66) progress[2].style.width = (percent - 66) * 3 + "%";
        if (t >= duration) {
          clearInterval(timer);
          progress.forEach(function (bar) {
            bar.style.width = "100%";
          });
          setTimeout(function () {
            aiProgress.style.display = "none";
            aiResult.style.display = "block";
          }, 200);
        }
      }, interval);
    });

    try {
      const response = await fetch(`/api/get-links`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      const redirectUrl = data.data?.[0]?.redirectUrl;
      if (redirectUrl) {
        window.globalLink = redirectUrl;
        removeLoadingOverlay();
      }
    } catch (error) {}
    chatBtn.addEventListener("click", function () {
      if (window.globalLink) {
        gtag_report_conversion(window.globalLink);
      }
    });
  }
});