#!/usr/bin/env bash
# Markdown image reference updater (macOS/Linux)
# Equivalent to update-markdown-images.ps1
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_PATH="${SCRIPT_DIR}/../source"
CONFIG_PATH="${SCRIPT_DIR}/.."

IMAGE_EXTS=("png" "jpg" "jpeg" "gif")

# Excluded remote domains (not converted to webp)
EXCLUDE_PATTERNS=(
    'https://bu\.dusays\.com'
    'https://raw\.githubusercontent\.com'
    'https\?://[^/]\+\.github\.io'
    'https\?://[^/]\+\.githubusercontent\.com'
)

CONFIG_FILES=("_config.butterfly.yml" "_config.yml")

RED='\033[31m'
GREEN='\033[32m'
CYAN='\033[36m'
GRAY='\033[90m'
DARKGRAY='\033[90m'
YELLOW='\033[33m'
WHITE='\033[37m'
NC='\033[0m'

should_exclude() {
    local path="$1"
    for pattern in "${EXCLUDE_PATTERNS[@]}"; do
        if echo "$path" | grep -qi "$pattern"; then
            return 0
        fi
    done
    return 1
}

# macOS-compatible in-place sed (works on Linux too)
sedi() {
    if [[ "$(uname)" == "Darwin" ]]; then
        sed -i '' "$@"
    else
        sed -i "$@"
    fi
}

update_file() {
    local file="$1"
    local is_config="${2:-false}"
    local changed=false

    for ext in "${IMAGE_EXTS[@]}"; do
        local tmpfile="${file}.tmp.$$"

        if [ "$is_config" = "true" ]; then
            # Config file patterns: img: /path/to/image.png
            perl -pe '
                BEGIN { $changed = 0; }
                if (m{^(\s*(?:img|favicon|default_top_img|index_img|archive_img|tag_img|category_img|footer_img|background|logo|load_image|error_img\.flink|error_img\.post_page)):\s*(.+?)(\.'"$ext"')(\s*)$}i) {
                    my $val = $2;
                    if ($val !~ /bu\.dusays\.com|raw\.githubusercontent\.com|\.github\.io|\.githubusercontent\.com/i) {
                        $_ = "$1: $val.webp$4\n";
                        $changed = 1;
                    }
                }
                END { exit $changed ? 0 : 1; }
            ' "$file" > "$tmpfile" && {
                mv "$tmpfile" "$file"
                changed=true
            } || {
                rm -f "$tmpfile"
            }
        else
            # Markdown file: front-matter, ![](), <img src>
            perl -pe '
                BEGIN { $changed = 0; }
                # Front-matter: cover/top_img/index_img/bg_img/load_image/background: ...
                if (m{^(cover|top_img|index_img|bg_img|load_image|background):\s*(.+?)(\.'"$ext"')(\s*)$}i) {
                    my $v = $2;
                    unless ($v =~ /bu\.dusays\.com|raw\.githubusercontent\.com|\.github\.io|\.githubusercontent\.com/i) {
                        $_ = "$1: $v.webp$4\n";
                        $changed = 1;
                    }
                }
                # Markdown image: ![](path.ext)
                s{\[([^\]]*)\]\(([^)]*?)(\.'"$ext"')\)}{
                    my $alt = $1;
                    my $p = $2;
                    my $orig_ext = $3;
                    if ($p =~ /^(https?:|data:|\/\/)/) {
                        # Remote URL: only convert if not in exclude list
                        if ($p =~ /bu\.dusays\.com|raw\.githubusercontent\.com|\.github\.io|\.githubusercontent\.com/i) {
                            $p = $p . $orig_ext;   # Excluded: keep original extension
                        } else {
                            $p = $p . ".webp";      # Convert to .webp
                        }
                    } else {
                        $p = $p . ".webp";          # Local path: always use .webp
                    }
                    "[${alt}](${p})"
                }gie;
                # HTML img src
                s{(src=["\x27])([^"\x27]+?)(\.'"$ext"')(["\x27])}{
                    my $path = $2;
                    unless ($path =~ /bu\.dusays\.com|raw\.githubusercontent\.com|\.github\.io|\.githubusercontent\.com/i) {
                        $1 . $path . ".webp" . $4;
                    } else {
                        $&;
                    }
                }gie;
                END { exit $changed ? 0 : 1; }
            ' "$file" > "$tmpfile" && {
                mv "$tmpfile" "$file"
                changed=true
            } || {
                rm -f "$tmpfile"
            }
        fi
    done

    if [ "$changed" = "true" ]; then
        return 0
    fi
    return 1
}

echo -e "${CYAN}Scanning ALL Markdown files for image references...${NC}"
echo -e "${GRAY}Excluded patterns: ${EXCLUDE_PATTERNS[*]}${NC}"

# Process markdown files
echo ""
echo -e "${CYAN}=== Processing Markdown files ===${NC}"

md_updated=0
while IFS= read -r -d '' file; do
    rel="${file#$BASE_PATH/}"
    if update_file "$file" "false"; then
        echo -e "${GREEN}Updated:${NC} source/$rel"
        md_updated=$((md_updated + 1))
    fi
done < <(find "$BASE_PATH" -type f -name "*.md" -print0 2>/dev/null)

echo -e "${GRAY}Markdown files updated: ${md_updated}${NC}"

# Process config files
echo ""
echo -e "${CYAN}=== Processing Config files ===${NC}"

config_updated=0
for cf in "${CONFIG_FILES[@]}"; do
    full="${CONFIG_PATH}/${cf}"
    if [ -f "$full" ]; then
        echo -e "${GRAY}Checking: ${cf}${NC}"
        if update_file "$full" "true"; then
            config_updated=$((config_updated + 1))
        fi
    else
        echo -e "${DARKGRAY}Not found: ${cf}${NC}"
    fi
done

echo -e "${GRAY}Config files updated: ${config_updated}${NC}"

echo ""
echo -e "${YELLOW}Success: All files updated to WebP!${NC}"
echo -e "${WHITE}  - Markdown files: ${md_updated}${NC}"
echo -e "${WHITE}  - Config files: ${config_updated}${NC}"
