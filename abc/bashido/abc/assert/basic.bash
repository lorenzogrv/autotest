source "$(bashido abc-log)"
source "$(bashido abc-is)"
source "$(bashido basic-str)"

##
# General use error action: Use "fail" to report error and exit
#TODO descriptive exit codes? see `man exit`
# 126    A file to be executed was found, but it was not an executable utility.
# 127    A utility to be executed was not found.
Error () {
  ! is_int "$1" && fail "assertion error: $@";
  local c=$1; shift; emsg "assertion error: $@"; exit $c
}

# cause an error due to a no existing directory entry
# "entries" can be directories, regular files, symlinks, sockets, pipes, ...
# This error has no possible fix, as it's unkown what type of entry should be
# meaningof ENOENT: http://stackoverflow.com/a/19902850/1894803
Error_ENOENT () {	Error "Entry '$1' does not exist"; }
Error_ENODIR () {	Error_ENOENT "$1"; }
Error_ENOREG () {	Error_ENOENT "$1"; }
# cause an error because current user has not permission $1 for file $2
Error_EACCES () { Error "Missing '$1' permission for entry '$2'"; }

#TODO assert_var_set: http://stackoverflow.com/questions/3601515/how-to-check-if-a-variable-is-set-in-bash

##
# String assertions
assert_str () { test -n "$1" || Error "'$1' must be a non-empty string"; }
assert_function () {
  assert_str "$1"
  is_function "$1" || Error "'$1' does not pass is_function test"
}


##
# Integer assertions
assert_int () { is_int "$1" || Error "'$1' must be an integer"; }
# Asserts $1 is an even integer. From http://stackoverflow.com/q/15659848/1894803
# NOTE: aritmetic expressions have exit status 1 when equal to 0, see `help "(("`
assert_int_par () { { ! (( ${1} % 2 )); } || Error "'$1' must be an even integer"; }
assert_int_odd () { (( ${1} % 2 )) || Error "'$1' must be an odd integer"; }

##
# filesystem assertions
# `test` quick ref: `help test` or `help [`
# `test` reference: http://wiki.bash-hackers.org/commands/classictest
##

assert_ent_exists () { test -e "$1" || Error_ENOENT "$1"; }
assert_dir_exists () { test -d "$1" || Error_ENODIR "$1"; }
# "file" is not exclusive describing a regular file, so not a good name
assert_reg_exists () { test -f "$1" || Error_ENOREG "$1"; }

# TODO error should not be ENOENT when entity exist but it's not readable
assert_reg_perm_r () {
	assert_reg_exists "$1" && test -r "$1" || Error_EACCES "r" "$1"
}
# TODO error should not be ENOENT when entity exist but it's not executable
assert_reg_perm_x () {
	assert_reg_exists "$1" && test -x "$1" || Error_EACCES "x" "$1"
}

##
# Asserts global variable scope is writable ($BASH_SUBHELL=0)
# - arg $1: optional error message to replace the default message
assert_global_scope () {
  if [[ $BASH_SUBSHELL != 0 ]]; then
    local msg=${1:-'Write access to the global variable scope is required'}
    read line fn file <<< $(caller 1) # omit the assert call from trace
    Error "$msg:\nAt (file:line) $file:$line\n'$fn' runs in a lvl $BASH_SUBSHELL bash subshell." 
    # fail performs an exit, so while loop below never runs
    # TODO would be awesome to stop the main process at subshell 0,
    # IS POSSIBLE? HOW?
    while [[ $BASH_SUBSHELL != 0 ]]; do exit 1; done
  fi
}

##
# Asserts previous command exit code ($?) was '$1'
# - exit codes with special meanings http://www.tldp.org/LDP/abs/html/exitcodes.html
assert_code () {
  local xcode=$?
	assert_int $1
	if test "$xcode" -eq "$1"; then return 0; fi
  local ecode=$((xcode+1));
  case "$xcode" in 255) ecode=$xcode ;; esac
  Error $ecode "exit code was $xcode, while expecting $1."
}

##
# vim modeline
# /* vim: set filetype=sh shiftwidth=2 ts=2: */
