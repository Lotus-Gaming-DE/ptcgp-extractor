import os
import subprocess
from scripts import fetch_data, run_export


def test_fetch_data_invokes_node(monkeypatch):
    called = {}

    def fake_run(cmd, check):
        called["cmd"] = cmd
        return 0

    monkeypatch.setattr(subprocess, "run", fake_run)
    fetch_data.main([])

    assert called["cmd"][0] == "node"


def test_load_env(tmp_path, monkeypatch):
    env_file = tmp_path / ".env"
    env_file.write_text("FOO=bar\n")
    monkeypatch.delenv("FOO", raising=False)
    run_export.load_env(str(env_file))
    assert os.environ["FOO"] == "bar"
