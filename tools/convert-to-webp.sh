#!/usr/bin/env bash
# WebP image converter (macOS/Linux)
# Equivalent to convert-to-webp.ps1
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_PATH="${SCRIPT_DIR}/../source"
THEME_PATH="${SCRIPT_DIR}/../themes/butterfly/source"

IMAGE_EXTS=("png" "jpg" "jpeg" "gif")
DIRECTORIES=("img" "imgs" "_posts" "about" "swiper" "coffer" "birthday-gift")
THEME_DIRS=("img")

QUALITY=75

RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
MAGENTA='\033[35m'
CYAN='\033[36m'
GRAY='\033[90m'
NC='\033[0m'

# Find cwebp
CWEBP=$(command -v cwebp 2>/dev/null || echo "")
if [ -z "$CWEBP" ]; then
    # Check common Homebrew paths
    if [ -f "/opt/homebrew/bin/cwebp" ]; then
        CWEBP="/opt/homebrew/bin/cwebp"
    elif [ -f "/usr/local/bin/cwebp" ]; then
        CWEBP="/usr/local/bin/cwebp"
    fi
fi

if [ -z "$CWEBP" ]; then
    echo -e "${RED}Error: cwebp not found! Install with: brew install webp${NC}"
    exit 1
fi

GIF2WEBP=$(command -v gif2webp 2>/dev/null || echo "")

test_webp_valid() {
    [ -f "$1" ] && [ -s "$1" ]
}

remove_source() {
    if rm -f "$1"; then
        echo -e "  ${YELLOW}[Deleted]${NC} Source deleted"
    else
        echo -e "  ${RED}[Error]${NC} Delete failed: $1"
    fi
}

process_image() {
    local file="$1"
    local ext="${file##*.}"
    ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
    local webp_path="${file%.*}.webp"
    local source_modified
    source_modified=$(stat -f %m "$file" 2>/dev/null || stat -c %Y "$file" 2>/dev/null)

    # Case 1: WebP missing or source newer
    if [ ! -f "$webp_path" ]; then
        do_convert "$file" "$webp_path" "$ext"
    elif [ "$source_modified" -gt "$(stat -f %m "$webp_path" 2>/dev/null || stat -c %Y "$webp_path" 2>/dev/null)" ]; then
        do_convert "$file" "$webp_path" "$ext"
    # Case 2: WebP valid → skip convert, delete source
    elif test_webp_valid "$webp_path"; then
        echo -e "  ${BLUE}[Exists]${NC} WebP exists: $(basename "$file")"
        remove_source "$file"
    # Case 3: WebP corrupted → reconvert
    else
        echo -e "  ${MAGENTA}[Invalid]${NC} WebP corrupted, reconverting: $(basename "$file")"
        rm -f "$webp_path"
        do_convert "$file" "$webp_path" "$ext"
    fi
}

do_convert() {
    local src="$1"
    local dst="$2"
    local ext="$3"
    local ok=false

    if [ "$ext" = "gif" ] && [ -n "$GIF2WEBP" ]; then
        if "$GIF2WEBP" -q "$QUALITY" -mixed "$src" -o "$dst" > /dev/null 2>&1 && test_webp_valid "$dst"; then
            ok=true
        fi
    elif [ "$ext" != "gif" ]; then
        if "$CWEBP" -q "$QUALITY" "$src" -o "$dst" > /dev/null 2>&1 && test_webp_valid "$dst"; then
            ok=true
        fi
    elif [ "$ext" = "gif" ] && [ -z "$GIF2WEBP" ]; then
        echo -e "  ${YELLOW}[Skip]${NC} gif2webp not found: $(basename "$src")"
        return
    fi

    if [ "$ok" = true ]; then
        echo -e "  ${GREEN}[OK]${NC} $(basename "$src") -> WebP"
        remove_source "$src"
    else
        echo -e "  ${RED}[Failed]${NC} Convert failed: $(basename "$src")"
    fi
}

scan_dir() {
    local dir="$1"
    local label="$2"
    echo -e "${CYAN}--- Scanning ${label}: ${dir} ---${NC}"

    local count=0
    for ext in "${IMAGE_EXTS[@]}"; do
        while IFS= read -r file; do
            [ -z "$file" ] && continue
            count=$((count + 1))
            process_image "$file"
        done < <(find "$dir" -type f -iname "*.${ext}" 2>/dev/null || true)
    done
    echo -e "${GRAY}Finished ${label}. Processed ${count} images.${NC}"
}

# Scan content directories
for d in "${DIRECTORIES[@]}"; do
    full="${BASE_PATH}/${d}"
    [ -d "$full" ] && scan_dir "$full" "$d"
done

# Scan theme directories
for d in "${THEME_DIRS[@]}"; do
    full="${THEME_PATH}/${d}"
    [ -d "$full" ] && scan_dir "$full" "theme/${d}"
done

echo -e "${YELLOW}Success: All assets optimized and source images cleaned!${NC}"
