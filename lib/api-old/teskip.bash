####
# #
# Finishises a test, like `tested`, but without exiting when code was > 0
teskip () {
	echo "SKIP (code $?): $@"
}

####
# Determines whenever a function can be used like `teskip`
# - $1: the function name, defaults to 'teskip'
teskip--test () {
  local func=${1:-teskip}
	(
		source <(autotest) || exit

		test_code_0_and_continues () {
			test $? -eq 0              ;tested "$cmd returns code 0"
			[[ "$out" =~ continues$ ]] ;tested "$cmd does not call exit"
		}

		cmd="'$func' running after a command that returns 0"
		out="$( true; $func bar; echo continues )"
		test_code_0_and_continues

		cmd="'$func' running after a command that returns > 0"
		out="$( false; $func foo; echo continues )"
		test_code_0_and_continues

		test -n "$( $func foo )" ;tested "'$func' writes reports to stdout"
	)
}

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
