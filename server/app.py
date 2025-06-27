from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

tone_classifier = pipeline("sentiment-analysis")

@app.route('/analyze-tone', methods=['POST'])
def analyze_tone():
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    result = tone_classifier(text)[0]
    return jsonify({
        'tone': result['label'],
        'confidence': round(result['score'], 4)
    })

if __name__ == '__main__':
    app.run(debug=True)
