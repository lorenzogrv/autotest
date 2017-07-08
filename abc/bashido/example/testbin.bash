# rely on the caller to properly source the dependencies
assert_function check || exit

# check api is an expressive command line parser
# provinding syntactic sugar to write tests in bash

check that 'echo hola' returns 0
check that 'echo hola' outputs 'hola'

check that 'which' is a command
check that 'check' is a function
check that 'autotest' is a file

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
