####
# #
# Determines whenever a test succeed reporting results suitably
# writed as-is intentionally, although it could be also
#     `(( $? )) && { echo FAIL; exit; } ; echo PASS`
# and too much other refactors, just picked a explicit one
tested () {
	local code=$? ;	(( $code )) && {
	  echo "FAIL $code $@"
		exit $code
	}
  echo "PASS $@"
}

####
# Determines whenever a function can be used like `tested`
# - $1: the function name, defaults to 'tested'
tested--test () {
  local func=${1:-tested}
	( # cannot use tested if this subshell fails
		fail () { echo "$FUNCNAME: '$func' $@"; exit 1; }

		out="$( true; $func bar; echo continues )"
		test $? -eq 0 || fail "return code should be 0 if test passes"
		[[ "$out" =~ continues$ ]] || fail "subshell should not have exit"

		out="$( false; $func foo; echo "continues" )"
		test $? -ne 0 || fail "return code should not be 0 if test fails"
		[[ "$out" =~ continues$ ]] && fail "subshell should have exited"

		exit 0
	) || {
	  echo "$FUNCNAME: '$func' does is not valid, see above for details"
		exit 1
	}
	# now it's safe to report tests
	$func "'$func' exits if last code failed, continues if passes"
	test -n "$( $func foo )"
	tested "'$func' writes reports to stdout"
}

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
