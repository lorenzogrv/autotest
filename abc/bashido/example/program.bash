source "$(bashido argv-program)" || exit

function example () {
	# an example command to demonstrate bashido's argv.program api
	##
	argv.program "$@"
}

function example.subcommand () {
	# an example subcommand to demonstrate bashido's argv.program api
	##
	echo "you ran $command"
}

function example.anotherone () {
	# another subcommand to demonstrate bashido's argv.program api
	##
	echo "you ran $command"
}

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
