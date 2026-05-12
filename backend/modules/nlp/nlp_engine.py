import spacy
from typing import Dict, Any

class NLPEngine:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:

            self.nlp = None
            print("Warning: spacy model 'en_core_web_sm' not found. Please run 'python -m spacy download en_core_web_sm'")

    def analyze_text(self, text: str) -> Dict[str, Any]:
        if not self.nlp:
            return {"text": text, "error": "NLP model not loaded"}

        doc = self.nlp(text)

        entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
        tokens = [token.text for token in doc]

        sentiment = "neutral"
        if any(word in text.lower() for word in ["happy", "good", "great", "excellent"]):
            sentiment = "positive"
        elif any(word in text.lower() for word in ["bad", "sad", "terrible", "angry"]):
            sentiment = "negative"

        return {
            "text": text,
            "entities": entities,
            "tokens": tokens,
            "sentiment": sentiment,
            "noun_chunks": [chunk.text for chunk in doc.noun_chunks]
        }

if __name__ == "__main__":
    engine = NLPEngine()
    result = engine.analyze_text("Hello Boss, I am ready to secure the world.")
    print(result)
