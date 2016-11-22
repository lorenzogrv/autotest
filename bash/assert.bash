source "bash/abc.bash"

##
# General use assert-failed action: Use "fail" to report error and exit
#TODO descriptive exit codes?
assert_e () {
  ! is_int $1 && fail "assertion error: $@";
  local c=$1; shift; emsg "assertion error: $@"; exit $c
}

#TODO assert_var_set: http://stackoverflow.com/questions/3601515/how-to-check-if-a-variable-is-set-in-bash

##
# String assertions
assert_str () { [[ -n "$1" ]] || assert_e "'$1' must be an string"; }

##
# Integer assertions
assert_int () { is_int $1 || assert_e "'$1' must be an integer"; }
# Asserts $1 is an even integer. From http://stackoverflow.com/q/15659848/1894803
# NOTE: Observe aritmetic expression has exit status 1 if result = 0. Learn: `help "(("`
assert_int_par () { { ! (( ${1} % 2 )); } || assert_e "'$1' must be an even integer"; }
assert_int_odd () { (( ${1} % 2 )) || assert_e "'$1' must be an odd integer"; }

assert_e_ENOENT () { assert_e  "'$@' does not exist"; }
assert_dir_exists () { [[ -d "$1" ]] || assert_e_ENOENT "$1"; }
assert_file_exists () { [[ -f "$1" ]] || assert_e_ENOENT "$1"; }

##
# Asserts global variable scope is writable ($BASH_SUBHELL=0)
# - arg $1: optional error message to replace the default message
assert_global_scope () {
  if [[ $BASH_SUBSHELL != 0 ]]; then
    local msg=${1:-'Write access to the global variable scope is required'}
    read line fn file <<< $(caller 1) # omit the assert call from trace
    assert_e "$msg:\nAt (file:line) $file:$line\n'$fn' runs in a lvl $BASH_SUBSHELL bash subshell." 
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
  local xcode=$?; if test "$xcode" -eq "$1"; then return 0; fi
  local ecode=$((xcode+1));
  case "$xcode" in 255) ecode=$xcode ;; esac
  assert_e $ecode "exit code was $xcode, while expecting $1."
}

assert_function () {
  assert_str "$1"
  is_function "$1" || assert_e "'$1' does not pass is_function test"
}

##
# assertion helpers for TDD (should not been used for implementations)

##
# asserts that command line ($1) exit status code is equal to $2
# - stdout/stderr from `eval $1` are preserved/ignored depending on $2 value
# - When $2==0 stdout is ignored and stderr is preserved
# - When $2>=1 stdout is ignored and stderr is ignored too.
# - An assertion error raises when exit code does not match
# IMPORTANT
# - $1 is executed with `eval` to research the exit code
# - `eval` is used for a sake of simplicity, althought it's not "elegant"
# - this function is only for writing test cases
# REFERENCE
# - http://mywiki.wooledge.org/BashFAQ/050
assert_1_returns_2 () {
  assert_str $1 ; assert_int $2
  if test $2 -eq 0
  then ( eval $1 ) 1>/dev/null ; # ignore stdout
  else ( eval $1 ) &>/dev/null ; # ignore stdout and stderr
  fi # eval in subshell to avoid premature exit triggered by eval'ed code
  local xcode=$?; if test "$xcode" -eq "$2"; then return 0; fi
  assert_e "After running '$1' exit code was $xcode, while expecting $2."
  # Code match implies success, elsecase it's failure (even when xcode=0)
}

##
# asserts that command line ($1) stdout is as described in $2
# TODO
# - The procedure should be writen to compare-by-character?
#   Using `diff` because the output from `cmp` is not descriptive enought
assert_1_outputs_2 () {
# - should use --suppress-common-lines too?
  diff --width=$(tput cols) --color=always <(eval $1) <(echo "$2")
}
