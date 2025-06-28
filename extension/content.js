chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkSelection") {
    const selection = window.getSelection().toString().trim();
    if (!selection) {
      sendResponse({ error: "No text selected." });
      return;
    }

    // Placeholder for claim checker
    sendResponse({ message: `Claim check will be added soon for: "${selection}"` });
    return true;
  }

  if (request.action === "analyzeArticle") {
    const url = window.location.href;

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

  if (request.action === "getPageText") {
    const pageText = document.body.innerText || "";
    sendResponse({ pageText });
    return true;
  }
});
