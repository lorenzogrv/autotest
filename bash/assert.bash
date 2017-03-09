source "bash/abc.bash"
source "bash/basic-str.bash"

##
# General use assert-failed action: Use "fail" to report error and exit
#TODO descriptive exit codes?
assert_e () {
  ! is_int "$1" && fail "assertion error: $@";
  local c=$1; shift; emsg "assertion error: $@"; exit $c
}

#TODO assert_var_set: http://stackoverflow.com/questions/3601515/how-to-check-if-a-variable-is-set-in-bash

##
# String assertions
assert_str () { [[ -n "$1" ]] || assert_e "'$1' must be an string"; }

##
# Integer assertions
assert_int () { is_int "$1" || assert_e "'$1' must be an integer"; }
# Asserts $1 is an even integer. From http://stackoverflow.com/q/15659848/1894803
# NOTE: aritmetic expressions have exit status 1 when equal to 0, see `help "(("`
assert_int_par () { { ! (( ${1} % 2 )); } || assert_e "'$1' must be an even integer"; }
assert_int_odd () { (( ${1} % 2 )) || assert_e "'$1' must be an odd integer"; }

##
# filesystem assertions
# `test` quick ref: `help test` or `help [`
# `test` reference: http://wiki.bash-hackers.org/commands/classictest
# meaningof ENOENT: http://stackoverflow.com/a/19902850/1894803
##
# cause an assertion error due to a no existing directory entry
# "entries" can be directories, regular files, symlinks, sockets, pipes, ...
assert_e_ENOENT () { assert_e  "Entry '$@' does not exist"; }

assert_ent_exists () { test -e "$1" || assert_e_ENOENT "$1"; }
assert_dir_exists () { test -d "$1" || assert_e_ENOENT "$1"; }
#TODO deprecate file_exists
# "file" is not exclusive describing a regular file, so not a good name
assert_file_exists () { test -f "$1" || assert_e_ENOENT "$1"; }

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
  local xcode=$?
	assert_int $1
	if test "$xcode" -eq "$1"; then return 0; fi
  local ecode=$((xcode+1));
  case "$xcode" in 255) ecode=$xcode ;; esac
  assert_e $ecode "exit code was $xcode, while expecting $1."
}

assert_function () {
  assert_str "$1"
  is_function "$1" || assert_e "'$1' does not pass is_function test"
}

##
# util to test that two sources output the same
# diff quick reference:  `diff --help`
# TODO refactor the ansi thing.
BASHIDO_ASSERT_RESET=""  # "reset attributes" to default
BASHIDO_ASSERT_BEGIN=""  # signals a literal value display start
BASHIDO_ASSERT_TRAIL=""  # signals a literal value display finish
BASHIDO_ASSERT_ACTUAL="" # part of "actual" value that was not expected
BASHIDO_ASSERT_EXPECT="" # part of "expected" value not found within actual
BASHIDO_ASSERT_FCOLOR=""
BASHIDO_ASSERT_BCOLOR=""
verb () { printf "$@" >&2; }
diff_str () {
	local actual="$(printf %s "$1")" expect="$(printf %s "$2")"

	# when actual is equal to expect, return 0 and output nothing
	test "$actual" == "$expect" && return 0

	#verb "$FUNCNAME: '%s' is not equal to '%s'\n" "$actual" "$expect"

	# formatting shit - TODO refactor this please
	local old="$(tput setab 3)"
	local new="$(tput setab 2)"
	local clr="$(tput sgr0)"
	local all="$(tput setab 7)$(tput setaf 0)"
	local w=$(tput cols) bar="|"
	if ! (( w % 2 )); then bar="||"; fi # TODO configurable bar means if bar is odd too
	w=$(( (w - ${#bar}) / 2 )) # odd column number requires an odd-lengthed bar

	# find the character where $actual start differing from $expected
	local c=0; while test $c -lt ${#expect}; do
		test "${actual:$c:1}" != "${expect:$c:1}" && break
		((c++))
	done

	printf -v actual '^%s%b%s%b' "${actual:0:$c}" "$old" "${actual:$c}" "$all"
	printf -v expect '%s%b%s%b$' "${expect:0:$c}" "$new" "${expect:$c}" "$all"

	local wa="$(str_ansifilter "$actual")"; wa=$(( w + ${#actual} - ${#wa} ))
	local we="$(str_ansifilter "$expect")"; we=$(( w + ${#expect} - ${#we} ))
	printf "%b%${wa}s%b%s%b%-${we}s%b\n" "$all" "$actual" "$clr" "$bar" "$all" "$expect" "$clr"
}
diff_test () {
	test $# -gt 0 -a $# -lt 3 || fail "$FUNCNAME: expected 1 or 2 args, $# given"

  local source1="${1}" source2="${2:--}" # source 2 defaults to stdin

  test -e "$source1" || fail "$FUNCNAME: source 1 ($source1) is not a file"
	if test "$source2" != "-"; then
		test	-e "$source2" || fail "$FUNCNAME: source 2 ($source2) is not a file"
	fi

	# diff side-by-side (-y) is not configurable enough, so customized output
	local diff_cmd="diff --strip-trailing-cr"
	diff_cmd+=" --unchanged-line-format="
	diff_cmd+=" --old-line-format=<%L"
	diff_cmd+=" --new-line-format=>%L"
	# seems ok to use diff and iterate only over differences but
	# TODO consider alternatives
	# - see http://stackoverflow.com/questions/8800578/colorize-diff-on-the-command-line
	local n=0 prev=""
	#diff_out="$( $diff_cmd "$source1" "$source2" )"
	while IFS= read line; do
		(( n++ ))
		case "${line:0:1}" in
			'<')
				# actual line when prev is not empty means no expected line
				if test -n "$prev"; then diff_str "$prev" ""; fi
				prev="${line#<}"
				;;
			'>')
				diff_str "${prev}" "${line#>}"
				prev=""
				;;
			*) echo "$FUNCNAME: unexpected '${line:0:1}' at diff's output line $n begin" ;;
		esac
  	# diff seems the right tool to get "only lines that differ"
	#done <<<"$diff_out"
  done < <( $diff_cmd "$source1" "$source2" )

	# reading only 1 empty line
	test $n -eq 1 && test -z "$prev" && {
	  diff_str "" "\n"
	}
	# return 0 only when diff has output nothing
	test $n -eq 0 # implicit return $?
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
##
# vim modeline
# /* vim: set filetype=sh shiftwidth=2 ts=2: */
