document.addEventListener("DOMContentLoaded", function () {
  let currentMode = "claim"; // Default mode

  const claimBtn = document.getElementById("claimMode");
  const articleBtn = document.getElementById("articleMode");
  const mainAction = document.getElementById("mainAction");
  const resultsContainer = document.getElementById("results");

  // Toggle buttons
  claimBtn.addEventListener("click", () => {
    currentMode = "claim";
    mainAction.textContent = "Check Selection";
    claimBtn.style.backgroundColor = "#007cba";
    claimBtn.style.color = "white";
    articleBtn.style.backgroundColor = "";
    articleBtn.style.color = "";
    resultsContainer.innerHTML = ""; // Clear results
  });

  articleBtn.addEventListener("click", () => {
    currentMode = "article";
    mainAction.textContent = "Analyze Article";
    articleBtn.style.backgroundColor = "#007cba";
    articleBtn.style.color = "white";
    claimBtn.style.backgroundColor = "";
    claimBtn.style.color = "";
    resultsContainer.innerHTML = ""; // Clear results
  });

  // Utility function for tone color
  function getColor(score) {
    if (score >= 0.75) return "green";
    if (score >= 0.5) return "yellow";
    return "red";
  }

  // Main button click
  mainAction.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Safety: block browser-internal pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
      alert('Cannot analyze this type of page.');
      return;
    }

    try {
      // Inject content script just in case
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (err) {
      console.log("Probably already injected:", err);
    }

    setTimeout(() => {
      const action = currentMode === "claim" ? "checkSelection" : "analyzeArticle";

      chrome.tabs.sendMessage(tab.id, { action }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Runtime error:", chrome.runtime.lastError.message);
          alert("Could not talk to the page. Try refreshing.");
          return;
        }

        // === CLAIM CHECKER MODE (just placeholder for now) ===
        if (currentMode === "claim") {
          if (response?.message) {
            alert(response.message);
          } else {
            alert(response?.error || "Something went wrong.");
          }
        }

        // === ARTICLE ANALYZER MODE ===
        else if (currentMode === "article" && response?.biasResult) {
          const bias = response.biasResult;
          resultsContainer.innerHTML = ""; // clear old cards

          // --- Bias Card ---
          const biasColor = {
            "Left": "bias-blue",
            "Lean Left": "bias-lightblue",
            "Center": "bias-neutral",
            "Lean Right": "bias-lightred",
            "Right": "bias-red",
            "Unknown": "bias-unknown"
          }[bias.bias] || "bias-unknown";

          const biasCard = document.createElement("div");
          biasCard.className = `card ${biasColor}`;
          biasCard.innerHTML = `
            <h3>Political Bias</h3>
            <p>${bias.bias} (${bias.domain})</p>
          `;
          resultsContainer.appendChild(biasCard);

          // --- Request Tone Analysis ---
          chrome.tabs.sendMessage(tab.id, { action: "getPageText" }, (textRes) => {
            if (textRes?.error) {
              const errCard = document.createElement("div");
              errCard.className = "card red";
              errCard.innerHTML = `<h3>Error</h3><p>${textRes.error}</p>`;
              resultsContainer.appendChild(errCard);
              return;
            }

            const fullText = (textRes?.pageText || "").slice(0, 2000);

            fetch("http://127.0.0.1:5000/analyze-tone", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: fullText }),
            })
              .then(res => res.json())
              .then(tone => {
                // Card color based on tone label
                const toneColor = {
                  "Positive": "green",
                  "Negative": "red",
                  "Neutral": "yellow"
                }[tone.tone] || "yellow";

                // Confidence text color class
                let confidenceClass = "confidence-low";
                if (tone.confidence >= 0.75) confidenceClass = "confidence-high";
                else if (tone.confidence >= 0.5) confidenceClass = "confidence-medium";

                const toneCard = document.createElement("div");
                toneCard.className = `card ${toneColor}`;
                toneCard.innerHTML = `
                  <h3>Tone Analysis</h3>
                  <p>${tone.tone}</p>
                  <p class="${confidenceClass}">${Math.round(tone.confidence * 100)}% confidence</p>
                `;
                resultsContainer.appendChild(toneCard);
                
              chrome.tabs.sendMessage(tab.id, { action: "countQuotes" }, (quoteRes) => {
                const quoteCard = document.createElement("div");

                let quoteColor = "red";
                if (quoteRes.quoteCount >= 6) quoteColor = "green";
                else if (quoteRes.quoteCount >= 3) quoteColor = "yellow";

                quoteCard.className = `card ${quoteColor}`;
                quoteCard.innerHTML = `
                  <h3>Quotes</h3>
                  <p>${quoteRes.quoteCount} direct quote${quoteRes.quoteCount !== 1 ? 's' : ''} found</p>
                `;

                resultsContainer.appendChild(quoteCard);

              chrome.tabs.sendMessage(tab.id, { action: "getSourceDiversity" }, (divRes) => {
                const diversityCard = document.createElement("div");

                let diversityColor = "red";
                if (divRes.count >= 6) diversityColor = "green";
                else if (divRes.count >= 3) diversityColor = "yellow";

                diversityCard.className = `card ${diversityColor}`;
                diversityCard.innerHTML = `
                  <h3>Source Diversity</h3>
                  <p>${divRes.count} unique linked domain${divRes.count !== 1 ? 's' : ''}</p>
                `;

                resultsContainer.appendChild(diversityCard);
              });

              });

              })
              .catch(err => {
                const errCard = document.createElement("div");
                errCard.className = "card red";
                errCard.innerHTML = `<h3>Error</h3><p>Could not fetch tone.</p>`;
                resultsContainer.appendChild(errCard);
              });
          });

        } else {
          alert(response?.error || "Unknown error.");
        }
      });
    }, 100);
  });
  

  // Default mode
  claimBtn.click();
  
});
