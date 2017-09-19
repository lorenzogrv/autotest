# rely on the caller to properly source the dependencies
assert_function check || exit

# check api is an expressive command line parser
# provinding syntactic sugar to write tests in bash

check that command 'echo hola' returns 0
check that command 'echo hola' outputs 'hola'

check that command 'which' is a command
check that command 'check' is a function
check that command 'autotest' is a file

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
