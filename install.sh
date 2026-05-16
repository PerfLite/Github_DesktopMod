#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
NAME="github-desktop-mod"
BIN_DIR="${HOME}/.local/bin"
APP_DIR="${HOME}/.local/share/applications"
LAUNCHER="${BIN_DIR}/${NAME}"
DESKTOP="${APP_DIR}/${NAME}.desktop"
ICON="${DIR}/ui/GitHub-logo.gif"

mkdir -p "$BIN_DIR" "$APP_DIR"

cat > "$LAUNCHER" << EOF
#!/bin/bash
DIR="${DIR}"
cd "\$DIR" || exit 1
source "\$DIR/venv/bin/activate"
python "\$DIR/app.py"
EOF
chmod +x "$LAUNCHER"
echo "✓ Created ${LAUNCHER}"

cat > "$DESKTOP" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=GitHub Desktop Mod
Comment=GitHub repository manager
Exec=${LAUNCHER}
Icon=${ICON}
Terminal=false
Categories=Development;Git;
StartupNotify=true
EOF
chmod +x "$DESKTOP"
echo "✓ Created ${DESKTOP}"

echo ""
echo "Done! You can now:"
echo "  • Run '${NAME}' from terminal"
echo "  • Find 'GitHub Desktop Mod' in your app menu"
echo "  • If you rename the project folder, just re-run: bash ${DIR}/install.sh"
