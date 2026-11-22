"""Cloud-handler regression tests; no network, database, real phrases or privileged keys."""
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import types
import unittest
from unittest.mock import Mock, patch


SOURCE = Path(__file__).resolve().parents[1] / "api" / "voice.py"


def load_module():
    spec = importlib.util.spec_from_file_location("stcs_voice_under_test", SOURCE)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class VoiceFunctionTest(unittest.TestCase):
    def setUp(self):
        self.module = load_module()

    def request(self, body, supplied="isolated-test-worker-key-never-used-in-cloud"):
        raw = json.dumps(body).encode()
        handler = object.__new__(self.module.handler)
        handler.headers = {"Content-Length": str(len(raw)), "x-stcs-worker-key": supplied}
        handler.rfile = io.BytesIO(raw)
        handler.reply = Mock()
        with patch.dict(os.environ, {"STCS_MEDIA_WORKER_KEY": "isolated-test-worker-key-never-used-in-cloud"}):
            handler.do_POST()
        return handler.reply.call_args.args

    def test_reviewed_config_matches_existing_voice_contract(self):
        config = self.module.CONFIG_PATH.read_bytes()
        self.assertEqual(hashlib.sha256(config).hexdigest(), self.module.FILES[self.module.CONFIG_PATH.name.replace("voice-model-config.json", "es_ES-davefx-medium.onnx.json")])
        self.assertEqual(json.loads(config)["espeak"]["voice"], "es")

    def test_cold_cache_uses_packaged_config_without_downloading_mutable_json(self):
        # Reproduces the failure condition: a cold function has the model but no config.
        # The upstream config differed from the reviewed hash. It must never be fetched.
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            model = b"isolated fake model"
            (folder / "es_ES-davefx-medium.onnx").write_bytes(model)
            self.module.FILES = dict(self.module.FILES)
            self.module.FILES["es_ES-davefx-medium.onnx"] = hashlib.sha256(model).hexdigest()
            loaded = object()
            loader = Mock(return_value=loaded)
            fake_piper = types.SimpleNamespace(PiperVoice=types.SimpleNamespace(load=loader))
            with patch.dict(sys.modules, {"piper": fake_piper}), patch.dict(os.environ, {"STCS_TTS_CACHE_DIR": directory}), patch.object(self.module.urllib.request, "urlopen", side_effect=AssertionError("Unexpected external config download")):
                self.assertIs(self.module.get_voice(), loaded)
                self.assertIs(self.module.get_voice(), loaded)
            self.assertEqual((folder / "es_ES-davefx-medium.onnx.json").read_bytes(), self.module.CONFIG_PATH.read_bytes())
            loader.assert_called_once()

    def test_corrupt_model_is_rejected_and_temporary_file_removed(self):
        with tempfile.TemporaryDirectory() as directory:
            fake_piper = types.SimpleNamespace(PiperVoice=types.SimpleNamespace(load=Mock()))
            with patch.dict(sys.modules, {"piper": fake_piper}), patch.dict(os.environ, {"STCS_TTS_CACHE_DIR": directory}), patch.object(self.module.urllib.request, "urlopen", return_value=io.BytesIO(b"corrupt")):
                with self.assertRaisesRegex(ValueError, "checksum"):
                    self.module.get_voice()
            self.assertEqual(list(Path(directory).iterdir()), [])

    def test_model_download_is_pinned_to_immutable_revision(self):
        self.assertNotIn("/main/", self.module.MODEL_URL)
        self.assertRegex(self.module.MODEL_REVISION, r"^[a-f0-9]{40}$")

    def test_missing_authorization_never_synthesizes(self):
        with patch.object(self.module, "synthesize") as synth:
            self.assertEqual(self.request({"text": "Prueba", "voice": self.module.VOICE}, supplied="")[0], 403)
            synth.assert_not_called()

    def test_invalid_phrase_never_synthesizes(self):
        with patch.object(self.module, "synthesize") as synth:
            self.assertEqual(self.request({"text": "", "voice": self.module.VOICE})[0], 422)
            self.assertEqual(self.request({"text": "x" * 96, "voice": self.module.VOICE})[0], 422)
            synth.assert_not_called()

    def test_model_failure_is_retryable_not_invalid_user_input(self):
        with patch.object(self.module, "synthesize", side_effect=ValueError("Model checksum mismatch")):
            self.assertEqual(self.request({"text": "Prueba", "voice": self.module.VOICE})[0], 503)

    def test_valid_request_returns_generated_wav(self):
        with patch.object(self.module, "synthesize", return_value=b"RIFF-isolated-wav"):
            result = self.request({"text": "Prueba", "voice": self.module.VOICE})
        self.assertEqual(result, (200, b"RIFF-isolated-wav", "audio/wav"))


if __name__ == "__main__":
    unittest.main()
