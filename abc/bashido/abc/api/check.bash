autotest checkup && source <(autotest) || exit

function check () {
	local fname="check.$1"
	assert_function "$fname"
	shift
	$fname "$@"
}

function check.that () {
	# the behaviour is actually the same as check()
	check "$@"
	return
	# TODO consider the usefulness of "that" other than being expressive
	local fname="check.$1"
	assert_function "$fname"
	shift
	$fname "$@"
}

bashido.require "check.command"

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
