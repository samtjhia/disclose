from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

tone_classifier = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

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
        'confidence': round(result['score'], 4)
    })

if __name__ == '__main__':
    app.run(debug=True)
