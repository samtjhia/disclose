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

  if (request.action === "countQuotes") {
    const text = document.body.innerText || "";

    // Match real quotations with at least 3 words inside
    const patterns = [
      /"([^"]*?\b\w+\b[^"]*?\b\w+\b[^"]*?\b\w+\b[^"]*?)"/g,    // straight quotes with 3+ words
      /“([^”]*?\b\w+\b[^”]*?\b\w+\b[^”]*?\b\w+\b[^”]*?)”/g     // curly quotes with 3+ words
    ];

    let totalQuotes = 0;
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) totalQuotes += matches.length;
    }

    sendResponse({ quoteCount: totalQuotes });
    return true;
  }

  if (request.action === "getSourceDiversity") {
    // try to limit to actual article content
    const article = document.querySelector("article") || document.body;

    const anchors = Array.from(article.querySelectorAll("a[href]"));
    const pageDomain = window.location.hostname.replace(/^www\./, "").toLowerCase();
    const domains = new Set();

    anchors.forEach(anchor => {
      try {
        const url = new URL(anchor.href);
        const hostname = url.hostname.replace(/^www\./, "").toLowerCase();

        // only count external domains
        if (hostname !== pageDomain) {
          domains.add(hostname);
        }
      } catch (e) {
        // ignore bad URLs
      }
    });

    sendResponse({ uniqueDomains: Array.from(domains), count: domains.size });
    return true;
  }
  if (request.action === "checkAuthor") {
    let author = "";

    // Check <meta name="author" content="...">
    const meta = document.querySelector('meta[name="author"]');
    if (meta && meta.content) {
      author = meta.content.trim();
    }

    // If not found, try common visible bylines
    if (!author) {
      const byline = document.querySelector('[class*="byline"], [class*="author"], [id*="byline"], [id*="author"]');
      if (byline && byline.innerText.length < 100) {
        author = byline.innerText.trim();
      }
    }

    sendResponse({ author: author || null });
    return true;
  }



});
