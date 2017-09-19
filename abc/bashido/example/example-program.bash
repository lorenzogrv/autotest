# rely on the file which sources this one to properly source bashido api

assert_function bashido || exit
bashido.require "api.argv"

function example-program () {
	# an example command to demonstrate bashido's argv.program api
	##
	argv program "$FUNCNAME" "$@"
}

function example-program.subcommand () {
	# an example subcommand to demonstrate bashido's argv.program api
	##
	echo "you ran $command"
}

function example-program.anotherone () {
	# another subcommand to demonstrate bashido's argv.program api
	##
	echo "you ran $command"
}

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
