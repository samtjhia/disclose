from flask import Flask, request, jsonify
from transformers import pipeline
from urllib.parse import urlparse
from rapidfuzz import process
import pandas as pd

app = Flask(__name__)

print("🔧 Device set to use cpu")

# 🎯 Load tone analysis pipeline
tone_classifier = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

# 📥 Load domain bias CSV
def load_all_sides(file_path):
    df = pd.read_csv(file_path)
    # Build lookup: { "foxnews": "Right", "cnn": "Left", ... }
    return {
        row['news_source'].strip().lower().replace(" ", "").replace("www.", ""): 
        convert_rating(row['rating_num'])
        for _, row in df.iterrows()
        if pd.notna(row['news_source']) and pd.notna(row['rating_num'])
    }

# 🧠 Convert numeric ratings (1–5) to labels
def convert_rating(num):
    try:
        num = int(num)
        return {
            1: "Left",
            2: "Lean Left",
            3: "Center",
            4: "Lean Right",
            5: "Right"
        }.get(num, "Unknown")
    except:
        return "Unknown"

# 🗂️ Load CSV data into dictionary
domain_bias = load_all_sides("allsides_data.csv")
print(f"🔎 Loaded domain_bias keys: {list(domain_bias.keys())[:20]}...")

# 🔍 Smart domain-to-source matching
def get_domain_bias(url):
    parsed = urlparse(url)
    domain = parsed.netloc.lower().replace("www.", "")
    domain_root = domain.split(".")[0]  # e.g., "foxnews" from "foxnews.com"

    match, score, _ = process.extractOne(domain_root, domain_bias.keys())
    if score >= 85:
        return domain_bias[match]
    
    return "Unknown"

# 🧪 Endpoint: Tone Analysis
@app.route('/analyze-tone', methods=['POST'])
def analyze_tone():
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    result = tone_classifier(text)[0]
    label = result['label']
    score = result['score']

    if score < 0.5:
        tone = "NEUTRAL"
    elif "1" in label or "2" in label:
        tone = "NEGATIVE"
    elif "3" in label:
        tone = "NEUTRAL"
    else:
        tone = "POSITIVE"

    return jsonify({
        'tone': tone,
        'confidence': round(score, 4)
    })

# 🧪 Endpoint: Domain Bias Lookup
@app.route('/get-bias', methods=['POST'])
def get_bias():
    data = request.get_json()
    url = data.get('url', '')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    bias = get_domain_bias(url)

    return jsonify({
        'domain': urlparse(url).netloc,
        'bias': bias
    })

if __name__ == '__main__':
    app.run(debug=True)
