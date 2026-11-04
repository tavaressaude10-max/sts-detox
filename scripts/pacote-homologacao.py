"""Cria o ZIP de runtime após npm run verificar, sem incluir arquivos privados."""
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "package.json").read_text(encoding="utf-8"))
manifest["scripts"] = {"build": "node verificar-pacote.mjs", "start": "node homologacao.mjs"}
verify = """import {access} from 'node:fs/promises';
await access('server.js');
await access('homologacao.mjs');
await access('build/index.html');
await import('./.server-build/server/main.js');
await import('./.server-build/server/bootstrap.js');
"""
from tempfile import NamedTemporaryFile

with NamedTemporaryFile(dir=root, suffix=".zip", delete=False) as tmp:
    archive = Path(tmp.name)
with ZipFile(archive, "w", ZIP_DEFLATED, strict_timestamps=False) as package:
    package.writestr("package.json", json.dumps(manifest, indent=2))
    package.writestr("verificar-pacote.mjs", verify)
    for name in ["package-lock.json", "server.js", "homologacao.mjs"]:
        package.write(root / name, name)
    for output in ["build", ".server-build"]:
        for file in sorted((root / output).rglob("*")):
            if file.is_file():
                package.write(file, file.relative_to(root).as_posix())
    for name in ["build/index.html", ".server-build/server/main.js", ".server-build/server/bootstrap.js"]:
        package.getinfo(name)
archive.replace(root / "assistente-homologacao.zip")
