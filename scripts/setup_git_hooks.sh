#!/usr/bin/env bash
set -euo pipefail

npx husky init || true

echo "#!/usr/bin/env sh
. \"$(dirname -- "$0")/_/husky.sh\"

npx lint-staged
" > .husky/pre-commit

chmod +x .husky/pre-commit

echo "Husky pre-commit hook installed."