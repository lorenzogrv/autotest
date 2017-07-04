source "$(bashido assert.basic)"
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
function assert.command.returns () {
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
function assert.command.outputs () {
# - should use --suppress-common-lines too?
  diff --width=$(tput cols) --color=always <(eval $1) <(echo "$2")
}

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
