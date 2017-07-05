source "$(bashido abc.log)" || exit
source "$(bashido abc.error)" || exit

declare -a BASHIDO_REQUIRED
function bashido.require () {
	local ref="${1:?'missing lib reference'}"
	verb "process $$ requires sourcing %s" "$1"
	#echo "${BASHIDO_REQUIRED[@]}"
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
