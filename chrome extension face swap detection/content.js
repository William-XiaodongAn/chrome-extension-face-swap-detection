const NOTIFICATION_POSITIONS = [
  { top: '20px', right: '20px' },
  { top: '20px', left: '20px' },
  { bottom: '20px', right: '20px' },
  { bottom: '20px', left: '20px' },
  { top: '50%', right: '20px', transform: 'translateY(-50%)' },
  { top: '50%', left: '20px', transform: 'translateY(-50%)' },
];

let globalFaceIdx = 0;

function captureFaces() {
  const videos = document.querySelectorAll("video");
  globalFaceIdx = 0; // Reset for each round
  videos.forEach((vid) => {
    if (!(vid.srcObject && vid.srcObject.getVideoTracks)) return;
    const tracks = vid.srcObject.getVideoTracks();
    if (!tracks.length) return;
    const hasValidWebcam = tracks.some(track => {
      const label = track.label;
      if (!label) return false;
      // convert label to lower case and exclude any screen share videos
      const lowerLabel = label.toLowerCase();
      return !lowerLabel.includes("screen") && !lowerLabel.includes("window") && !lowerLabel.includes("tab");
    });
    if (!hasValidWebcam) return;
    if (vid.videoWidth < 100 || vid.readyState < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL("image/jpeg");
    sendToServer(dataURL, vid, globalFaceIdx++);
  });
}

function sendToServer(dataURL, videoElement, notifIdx) {
  fetch("http://localhost:8000/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataURL })
  })
    .then(res => res.json())
    .then(data => {
      if (data.full_response && data.full_response.faces && data.full_response.faces.length > 0) {
        showFaceNotification(data.full_response.faces[0], notifIdx, videoElement);
      } else if (data.error) {
        displayError(data.error);
      }
    })
    .catch(err => {
      displayError("Connection error");
    });
}

// Helper function to convert dataURL to Blob
function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function showFaceNotification(face, idx, videoElement) {
  const score = face.blended_fakeness_score;
  const percentage = (score * 100).toFixed(1);
  const riskLevel = score > 0.5 ? 'HIGH RISK' : 'LOW RISK';

  // Unique ID for each notification per video
  const notifId = `face-score-notification-${idx}`;
  // Remove any existing overlay for this video
  let notification = videoElement.parentElement.querySelector(`#${notifId}`);
  if (notification) notification.remove();

  // Create overlay
  notification = document.createElement('div');
  notification.id = notifId;
  notification.className = 'face-score-notification';
  notification.style.position = 'absolute';
  notification.style.top = '10px';
  notification.style.left = '10px';
  notification.style.background = score > 0.5 ? '#ff4444' : '#44ff44';
  notification.style.color = 'white';
  notification.style.padding = '8px 14px';
  notification.style.borderRadius = '8px';
  notification.style.fontFamily = 'Arial, sans-serif';
  notification.style.fontSize = '14px';
  notification.style.fontWeight = 'bold';
  notification.style.zIndex = 10;
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
  notification.style.border = score > 0.5 ? '2px solid #cc0000' : '2px solid #00cc00';
  notification.style.pointerEvents = 'none'; // So it doesn't block video controls

  notification.innerHTML = `Face Swap Score: ${percentage}%<br>Risk: ${riskLevel}`;

  // Make sure the parent is positioned (so absolute works)
  const parent = videoElement.parentElement;
  if (getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }
  parent.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) notification.remove();
  }, 5000);
}

function displayError(error) {
  const errorDisplay = document.createElement('div');
  errorDisplay.id = 'face-swap-error';
  errorDisplay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff8800;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  `;
  errorDisplay.textContent = `Error: ${error}`;
  document.body.appendChild(errorDisplay);
  setTimeout(() => {
    if (errorDisplay.parentNode) {
      errorDisplay.remove();
    }
  }, 3000);
}

setInterval(captureFaces, 100);
