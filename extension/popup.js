document.addEventListener("DOMContentLoaded", () => {
  const checkSelectionBtn = document.getElementById("check-selection");
  const analyzePageBtn = document.getElementById("analyze-page");

  checkSelectionBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "check_selection" });
    });
  });

  analyzePageBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "analyze_article" });
    });
  });
});
