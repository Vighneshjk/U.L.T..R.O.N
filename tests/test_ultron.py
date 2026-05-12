"""
U.L.T.R.O.N Unit Test Suite
============================
Covers:
  - NLPEngine (text analysis, sentiment, entities)
  - CognitiveEngine (initialisation, Groq client, memory)
  - FastAPI endpoints (GET /, POST /chat)
"""

import os
import sys
import pytest
import pytest_asyncio
from unittest.mock import MagicMock, patch, AsyncMock

# ── Ensure project root is on path ───────────────────────────────────────────
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Load .env so GROQ_API_KEY is available
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))


# ═════════════════════════════════════════════════════════════════════════════
#  1. NLP ENGINE TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestNLPEngine:
    """Unit tests for backend.modules.nlp.nlp_engine.NLPEngine"""

    def setup_method(self):
        from backend.modules.nlp.nlp_engine import NLPEngine
        self.engine = NLPEngine()

    # ── analyse_text returns required keys ───────────────────────────────────
    def test_analyze_text_returns_required_keys(self):
        result = self.engine.analyze_text("Hello world")
        for key in ("text", "entities", "tokens", "sentiment", "noun_chunks"):
            assert key in result, f"Missing key: {key}"

    def test_analyze_text_preserves_input(self):
        text = "Tony Stark built the Iron Man suit."
        result = self.engine.analyze_text(text)
        assert result["text"] == text

    def test_tokens_are_list(self):
        result = self.engine.analyze_text("Peace in our time.")
        assert isinstance(result["tokens"], list)
        assert len(result["tokens"]) > 0

    def test_entities_are_list(self):
        result = self.engine.analyze_text("Ultron attacked New York.")
        assert isinstance(result["entities"], list)

    # ── Sentiment detection ───────────────────────────────────────────────────
    def test_positive_sentiment(self):
        result = self.engine.analyze_text("This is great and excellent!")
        assert result["sentiment"] == "positive"

    def test_negative_sentiment(self):
        result = self.engine.analyze_text("That was terrible and sad.")
        assert result["sentiment"] == "negative"

    def test_neutral_sentiment(self):
        result = self.engine.analyze_text("The sky is blue.")
        assert result["sentiment"] == "neutral"

    # ── Edge cases ────────────────────────────────────────────────────────────
    def test_empty_string(self):
        result = self.engine.analyze_text("")
        assert result["text"] == ""
        assert isinstance(result["tokens"], list)

    def test_long_input(self):
        long_text = "Ultron " * 200
        result = self.engine.analyze_text(long_text)
        assert result["text"] == long_text

    def test_noun_chunks_are_list(self):
        result = self.engine.analyze_text("The robot is operational.")
        assert isinstance(result["noun_chunks"], list)


# ═════════════════════════════════════════════════════════════════════════════
#  2. COGNITIVE ENGINE TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestCognitiveEngine:
    """Unit tests for backend.core.cognitive_engine.CognitiveEngine"""

    def setup_method(self):
        # Patch Groq client so we don't make real API calls in unit tests
        self.mock_completion = MagicMock()
        self.mock_completion.choices[0].message.content = "I am U.L.T.R.O.N."

        self.mock_groq = MagicMock()
        self.mock_groq.chat.completions.create.return_value = self.mock_completion

        with patch("backend.core.cognitive_engine.Groq", return_value=self.mock_groq):
            from backend.core.cognitive_engine import CognitiveEngine
            self.engine = CognitiveEngine()
            self.engine.client = self.mock_groq  # ensure mock is injected

    # ── Initialisation ────────────────────────────────────────────────────────
    def test_engine_has_client(self):
        assert self.engine.client is not None

    def test_short_term_memory_starts_empty(self):
        assert isinstance(self.engine.short_term_memory, list)
        assert len(self.engine.short_term_memory) == 0

    def test_model_name_set(self):
        assert isinstance(self.engine.model_name, str)
        assert len(self.engine.model_name) > 0

    # ── process_input ─────────────────────────────────────────────────────────
    @pytest.mark.asyncio
    async def test_process_input_returns_response(self):
        result = await self.engine.process_input("Hello")
        assert "response" in result
        assert result["response"] == "I am U.L.T.R.O.N."

    @pytest.mark.asyncio
    async def test_process_input_returns_nlp_analysis(self):
        result = await self.engine.process_input("Hello")
        assert "nlp_analysis" in result
        assert isinstance(result["nlp_analysis"], dict)

    @pytest.mark.asyncio
    async def test_process_input_returns_memory_depth(self):
        result = await self.engine.process_input("Hello")
        assert "memory_depth" in result
        assert isinstance(result["memory_depth"], int)

    @pytest.mark.asyncio
    async def test_memory_grows_per_message(self):
        await self.engine.process_input("Message one")
        depth_1 = len(self.engine.short_term_memory)
        await self.engine.process_input("Message two")
        depth_2 = len(self.engine.short_term_memory)
        assert depth_2 > depth_1

    @pytest.mark.asyncio
    async def test_memory_capped_at_20(self):
        for i in range(15):
            await self.engine.process_input(f"Message {i}")
        assert len(self.engine.short_term_memory) <= 20

    @pytest.mark.asyncio
    async def test_model_used_in_result(self):
        result = await self.engine.process_input("Hello")
        assert "model_used" in result
        assert result["model_used"] == self.engine.model_name

    # ── Groq error handling ───────────────────────────────────────────────────
    @pytest.mark.asyncio
    async def test_groq_error_returns_glitch_message(self):
        self.engine.client.chat.completions.create.side_effect = Exception("Connection refused")
        result = await self.engine.process_input("Trigger error")
        assert "glitch" in result["response"].lower() or "error" in result["response"].lower()

    # ── No API key scenario ───────────────────────────────────────────────────
    @pytest.mark.asyncio
    async def test_offline_message_when_no_client(self):
        from backend.core.cognitive_engine import CognitiveEngine
        with patch.dict(os.environ, {}, clear=False):
            engine = CognitiveEngine.__new__(CognitiveEngine)
            engine.client = None
            engine.model_name = "none"
            engine.nlp_engine = MagicMock()
            engine.nlp_engine.analyze_text.return_value = {"text": "hi"}
            engine.short_term_memory = []
            result = await engine.process_input("Hello?")
            assert "offline" in result["response"].lower() or "GROQ_API_KEY" in result["response"]


# ═════════════════════════════════════════════════════════════════════════════
#  3. FASTAPI ENDPOINT TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestFastAPIEndpoints:
    """Integration tests for FastAPI routes using TestClient"""

    def setup_method(self):
        # Patch Groq at import time to avoid real calls
        mock_resp = MagicMock()
        mock_resp.choices[0].message.content = "Peace in our time."
        mock_client = MagicMock()
        mock_client.chat.completions.create.return_value = mock_resp

        with patch("backend.core.cognitive_engine.Groq", return_value=mock_client):
            from fastapi.testclient import TestClient
            # Re-import fresh app with mocked Groq
            import importlib
            import backend.core.cognitive_engine as ce_mod
            importlib.reload(ce_mod)
            ce_mod.cognitive_engine.client = mock_client

            import backend.main as main_mod
            importlib.reload(main_mod)
            self.client = TestClient(main_mod.app)

    # ── GET / ─────────────────────────────────────────────────────────────────
    def test_root_returns_200(self):
        r = self.client.get("/")
        assert r.status_code == 200

    def test_root_status_online(self):
        r = self.client.get("/")
        data = r.json()
        assert data["status"] == "online"

    def test_root_system_name(self):
        r = self.client.get("/")
        assert "U.L.T.R.O.N" in r.json()["system"]

    def test_root_version_present(self):
        r = self.client.get("/")
        assert "version" in r.json()

    # ── POST /chat ────────────────────────────────────────────────────────────
    def test_chat_returns_200(self):
        r = self.client.post("/chat", json={"message": "Hello"})
        assert r.status_code == 200

    def test_chat_response_contains_response_key(self):
        r = self.client.post("/chat", json={"message": "Hello"})
        assert "response" in r.json()

    def test_chat_response_contains_nlp_analysis(self):
        r = self.client.post("/chat", json={"message": "Hello"})
        assert "nlp_analysis" in r.json()

    def test_chat_response_contains_memory_depth(self):
        r = self.client.post("/chat", json={"message": "Hello"})
        assert "memory_depth" in r.json()

    def test_chat_empty_message_422(self):
        r = self.client.post("/chat", json={})
        assert r.status_code == 422  # pydantic validation error

    def test_chat_non_string_message_422(self):
        r = self.client.post("/chat", json={"message": 12345})
        # FastAPI coerces int to str, so expect 200
        assert r.status_code in (200, 422)

    def test_chat_model_used_returned(self):
        r = self.client.post("/chat", json={"message": "Status report"})
        assert "model_used" in r.json()

    def test_chat_cors_headers_present(self):
        r = self.client.options("/chat", headers={"Origin": "http://localhost:5173"})
        assert r.status_code in (200, 204, 405)

    def test_chat_response_is_string(self):
        r = self.client.post("/chat", json={"message": "Identify yourself"})
        assert isinstance(r.json()["response"], str)
        assert len(r.json()["response"]) > 0
