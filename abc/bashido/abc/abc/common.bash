source "$(bashido abc.log)" || exit

declare -a BASHIDO_REQUIRED
function bashido.require () {
	local ref="${1:?'missing lib reference'}"
	echo "require $1"
	cat <<<"${BASHIDO_REQUIRED}"
	grep -w "$1" <<<"$BASHIDO_REQUIRED"
	if grep -e "$1" <<<"${BASHIDO_REQUIRED[@]}"
	then
		warn "process $$ already required $ref"
		return 0
	fi
	source "$(bashido $ref)" || fail "could not find $1"
	verb "process $$ sourced %s" "$1"
	BASHIDO_REQUIRED+="$1 "
}

bashido.require "abc.is"

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
