##
# General use error action
# TODO write tests for it
# TODO if no error function named $1, bad call
# TODO descriptive exit codes? see `man exit`
# 126    A file to be executed was found, but it was not an executable utility.
# 127    A utility to be executed was not found.
Error () {
  ! is_int "$1" && fail "Error: $@";
  local c=$1; shift; emsg "Error: $@"; exit $c
}

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
