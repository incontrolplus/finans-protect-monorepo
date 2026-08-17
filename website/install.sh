#!/usr/bin/env bash
# ==============================================================================
# OpenBalancer — Enterprise AI & API Load Balancer Installer
# Engineered & Maintained by INCONTROL PLUS ЕООД (https://openbalancer.com)
# License: MIT
# ==============================================================================

set -e

COLOR_CYAN='\033[0;36m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_CYAN}"
echo "  ___                   ____        _                               "
echo " / _ \ _ __   ___ _ __ | __ )  __ _| | __ _ _ __   ___ ___ _ __     "
echo "| | | | '_ \ / _ \ '_ \|  _ \ / _\` | |/ _\` | '_ \ / __/ _ \ '__|    "
echo "| |_| | |_) |  __/ | | | |_) | (_| | | (_| | | | | (_|  __/ |       "
echo " \___/| .__/ \___|_| |_|____/ \__,_|_|\__,_|_| |_|\___\___|_|       "
echo "      |_|                                                           "
echo -e "         Enterprise Async Load Balancer v1.4.2${COLOR_RESET}\n"

INSTALL_DIR="/opt/openbalancer"
CONFIG_FILE="${INSTALL_DIR}/config.json"
BIN_FILE="${INSTALL_DIR}/openbalancer.py"

echo -e "${COLOR_YELLOW}[1/4] Checking system prerequisites...${COLOR_RESET}"

# Check for Python 3.10+
if command -v python3 >/dev/null 2>&1; then
    PY_VER=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    echo -e "  Found Python ${COLOR_GREEN}${PY_VER}${COLOR_RESET}"
else
    echo -e "${COLOR_RED}Error: Python 3.10 or higher is required.${COLOR_RESET}"
    exit 1
fi

echo -e "\n${COLOR_YELLOW}[2/4] Setting up OpenBalancer directory at ${INSTALL_DIR}...${COLOR_RESET}"
mkdir -p "${INSTALL_DIR}"

# Download or create openbalancer.py
echo "  Fetching latest OpenBalancer core engine..."
curl -fsSL https://raw.githubusercontent.com/incontrolplus/openbalancer/main/core/openbalancer.py -o "${BIN_FILE}"
chmod +x "${BIN_FILE}"

# Download sample configuration if not present
if [ ! -f "${CONFIG_FILE}" ]; then
    echo "  Creating default cluster configuration..."
    curl -fsSL https://raw.githubusercontent.com/incontrolplus/openbalancer/main/core/config.json -o "${CONFIG_FILE}"
fi

echo -e "\n${COLOR_YELLOW}[3/4] Creating symlink /usr/local/bin/openbalancer...${COLOR_RESET}"
mkdir -p /usr/local/bin
cat << 'EOF' > /usr/local/bin/openbalancer
#!/usr/bin/env bash
exec python3 /opt/openbalancer/openbalancer.py /opt/openbalancer/config.json "$@"
EOF
chmod +x /usr/local/bin/openbalancer

echo -e "\n${COLOR_YELLOW}[4/4] Validating local installation...${COLOR_RESET}"
python3 -m py_compile "${BIN_FILE}"
echo -e "  ${COLOR_GREEN}✓ Syntax compilation verified!${COLOR_RESET}"

echo -e "\n${COLOR_GREEN}======================================================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}  🎉 OpenBalancer v1.4.2 has been successfully installed!${COLOR_RESET}"
echo -e "${COLOR_GREEN}======================================================================${COLOR_RESET}"
echo -e "  To start OpenBalancer:        ${COLOR_CYAN}openbalancer${COLOR_RESET}"
echo -e "  Configuration file:           ${COLOR_CYAN}${CONFIG_FILE}${COLOR_RESET}"
echo -e "  Status Telemetry Dashboard:   ${COLOR_CYAN}http://127.0.0.1:8088/openbalancer/status${COLOR_RESET}"
echo -e "  Official Documentation & SLA: ${COLOR_CYAN}https://www.openbalancer.com${COLOR_RESET}"
echo -e "  Support & Invoicing:          ${COLOR_CYAN}support@openbalancer.com${COLOR_RESET}\n"
