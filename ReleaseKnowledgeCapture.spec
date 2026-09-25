# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['app.py'],
    pathex=[],
    binaries=[],
    datas=[('ui', 'ui')],
    # truststore is imported inside a try/except ImportError in api.py (so
    # the app degrades gracefully on a machine without it) -- PyInstaller's
    # static analyzer doesn't reliably detect imports inside try/except,
    # so it silently gets left out of the build without this. Confirmed:
    # a build without this line contains zero trace of truststore anywhere.
    hiddenimports=['truststore'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='ReleaseKnowledgeCapture',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='ReleaseKnowledgeCapture',
)
