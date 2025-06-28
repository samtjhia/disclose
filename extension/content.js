// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkSelection") {
    const selection = window.getSelection().toString().trim();
    if (!selection) {
      sendResponse({ error: "No text selected." });
      return;
    }

    // Send selected text to backend API
    fetch("http://127.0.0.1:5000/analyze-tone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: selection }),
    })
      .then((res) => res.json())
      .then((data) => {
        sendResponse({ toneResult: data });
      })
      .catch((err) => {
        sendResponse({ error: "Failed to contact API." });
      });

    
    return true; // Keep message channel open
  }

  if (request.action === "analyzeArticle") {
    const url = window.location.href;

    // Send URL to backend to get bias
    fetch("http://127.0.0.1:5000/get-bias", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })
      .then((res) => res.json())
      .then((data) => {
        sendResponse({ biasResult: data });
      })
      .catch((err) => {
        sendResponse({ error: "Failed to contact API." });
      });

    return true;
  }
});
