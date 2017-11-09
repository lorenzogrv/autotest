# rely on the caller to properly source the dependencies
assert_function check || exit

# THIS IS NOT DONE YET
iai working
check that check works
  check that 'which' is a command
  check that 'echo hola' outputs 'hola'
  check that returns feature works
    check that 'true' returns 0;
    check that 'false' returns 1;
  check end
  check that returns feature returns 0 when code matches
    check that 'check that "exit 0" returns 0' returns 0
    check that 'check that "exit 1" returns 0' returns 1
    check that 'check that "exit 0" returns 1' returns 1
    check that 'check that "exit 7" returns 7' returns 0
    check that 'check that "exit 8" returns 9' returns 1
  check end
check end

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
