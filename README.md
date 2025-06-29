# Disclose

**Disclose** is a Chrome extension that helps users assess the factual accuracy and potential bias of online articles and claims.

Misinformation and biased reporting have become increasingly difficult to detect in today's online media landscape. Disclose was created to help users critically evaluate the content they consume by providing on-the-spot analysis of both individual claims and entire news articles. Rather than attempting to fully automate fact-checking, the extension offers transparency signals—like tone, political bias, source diversity, quote count, and author presence—to help users make informed judgments. By integrating AI models and public datasets, Disclose empowers users to identify low-quality or one-sided information while browsing, without requiring them to leave the page.

It offers two modes:

- **Claim Checker**: Highlight any claim (e.g., from a tweet or comment) and verify if it's been fact-checked using the Google Fact Check API.
- **Article Analyzer**: Automatically scans full news articles and evaluates tone, political bias, source diversity, number of quotes, and author attribution.

---

## Demo
https://github.com/user-attachments/assets/11bccf20-e8c7-44d1-8d5c-9efa12786c44

---


## Features

### ✅ Claim Checker Mode
- **Text Selection**: Select any text on a webpage.
- **Fact Check**: Queries the [Google Fact Check Tools API](https://toolbox.google.com/factcheck/explorer) to retrieve verdicts and sources.
- **Verdict Card**: Shows verdict (True / False / Unverified), source snippet, and a link to the original review.

### ✅ Article Analyzer Mode
Analyzes the open webpage across several factual signals:

| Signal           | Description |
|------------------|-------------|
| **Tone Analysis** | Uses Hugging Face model <a href="https://huggingface.co/nlptown/bert-base-multilingual-uncased-sentiment" target="_blank" rel="noopener noreferrer">`nlptown/bert-base-multilingual-uncased-sentiment`</a> to classify tone as Positive, Neutral, or Negative. |
| **Political Bias** | Detects political leaning of the domain using the <a href="https://github.com/favstats/AllSideR" target="_blank" rel="noopener noreferrer">AllSides dataset</a> and fuzzy matching via `rapidfuzz`. |
| **Source Diversity** | Counts number of unique external domains linked in the article. |
| **Quote Count** | Finds how many direct quotes appear in the text. |
| **Author Presence** | Checks for `<meta name="author">` and visible author bylines. |
| **Factual Score** | Aggregates the above signals into a single 0–100 score shown as a color-coded badge. |


---

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Chrome Extension Manifest v3)
- **Backend**: Python (Flask)
- **AI/ML**: Hugging Face Transformers
- **Data Sources**:
  - [Google Fact Check Tools API](https://developers.google.com/fact-check/tools/api)
  - [AllSides Media Bias Ratings](https://github.com/favstats/AllSideR) (GPL-3.0)

---

## Installation

```bash
# 1. Clone the Repository
git clone https://github.com/samtjhia/disclose.git
cd disclose

# 2. Setup the Backend
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Add Your Api Key
# Create a .env file inside server/:
FACTCHECK_API_KEY=your_google_fact_check_api_key_here

#4. Run Server
python app.py
```
### Load the Chrome Extension

1. Open `chrome://extensions/` in your browser  
2. Enable **Developer mode** (toggle in the top right)  
3. Click **Load unpacked**  
4. Select the `extension/` folder from the repo  


