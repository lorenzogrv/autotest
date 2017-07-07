if test "$(type -t bashido.require)" == "function"
then
	# as bashido.require was defined, asume log was loaded
	warn "process %s is sourcing bashido.require again" "$$"
	call_trace | warn
	# TODO execution should really raise a fatal error here
	# another workaround to avoid overriding BASHIDO_REQUIRE
	return # can't use exit as this file is meant to be sourced
fi

function bashido.require () {
	# with a nested function, its guaranteed that:
 	# - BASHIDO_REQUIRED is declared only once
	# - BASHIDO_REQUIRED is not set to empty if this file is sourced again
	declare -g BASHIDO_REQUIRED

	function bashido.require () {
		local ref="${1:?'missing lib reference'}"
		if grep -e "$1" <<<"$BASHIDO_REQUIRED" >/dev/null
		then
			warn "process $$ already required $ref"
			return 0
		fi
		source "$(bashido $ref)" || fail "could not find $1" || exit
		BASHIDO_REQUIRED+="$1,"
		verb "process $$ sourced %s" "$1" || echo "WTF $$ sourced $1"
	}

	bashido.require "$@" # call the require logic also the first time
}

bashido.require "abc.log" || exit

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
