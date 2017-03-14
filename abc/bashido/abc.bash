# no shebang because this file is meant to be sourced by bash
##

# abc-* files are sourced at once with this file
source <( find "$(bashido)" -name "abc-*" -exec cat {} + )

# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
