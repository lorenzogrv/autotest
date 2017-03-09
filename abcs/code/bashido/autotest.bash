# no shebang because this file is meant to be sourced by bash
##

# autotest-* files are sourced at once with this file
# TODO `find .bash`... ejem...
source <( find "$(bashido)" -name "autotest-*" -exec cat {} + )

# Ugly check to ensure tools were sourced
test "$(type -t 'tested')" == "function" || {
  >&2 echo "tested is not a function"
  source "$(bashido abc-call_trace)"
	call_trace
	exit 1
}

# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
