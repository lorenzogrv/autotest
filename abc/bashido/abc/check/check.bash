##
# This file is meant to be sourced. When $1 is '--no-alias',
# the `check` function (alias for iai-check) is not defined.
if test "$1" != "--no-alias"; then check () { iai-check "$@"; }; fi

##
# TODO this is a really ugly way to declare dependencies
source "$(bashido abc-log)" || exit
source "$(bashido abc-is)" || exit
source "$(bashido basic-array)" || exit
source "$(bashido basic-str)" || exit
source "$(bashido basic-math)" || exit
source "$(bashido check-checkdb)" || exit

##
# provides an expressive interface to write tests
# TODO
# - exit codes http://www.tldp.org/LDP/abs/html/exitcodes.html
iai-check () {
  # TODO ansi helper (clever way ;)
  _color_in="$(tput setab 7)$(tput setaf 0)"
  _color_ok="$(tput setaf 2)"
  _color_ko="$(tput setaf 1)"
  _color_no="$(tput sgr0)"

  # test "database"

  # "Collapsing Function" to reuse a private variable scope
  # see http://wiki.bash-hackers.org/howto/collapsing_functions
  # TODO private scope actually does not work
  iai-check () {
    local routine="iai-check-$1" # seems adecuate to provide extension hooks
    # when routine function exist, delegates on it.
    if type -t "$routine" >/dev/null; then shift; "$routine" "$@"; return; fi
    echo "iai-check: argument list '$@'"
    echo "           leads to unexistant routine '$routine'"
    call_trace 1
    exit 127 # Command not found - http://www.tldp.org/LDP/abs/html/exitcodes.html
  }

  ##
  # ends a test case, determining if it passed or failed
  # TODO explain better
  iai-check-end () {
    local sc=$?
    local id=$(iai-checkdb id)
    local lvl=$(iai-checkdb deep)
    local name=$(iai-checkdb name)
    local desc=$(iai-checkdb desc)
    #echo >&2 "[$$]#$BASH_SUBSHELL $FUNCNAME: id=$id name=$name desc=$desc"
    # test (current) details must be get before checkdb end
    iai-checkdb end
    # after checkdb end, can consult the test group (if any)
    ##
    # EMIT REPORTS
    # GROUP-START REPORT
    local deep=$(iai-checkdb deep)
    for (( n=0 ; n < deep ; n++ )); do
      local tgid=$(iai-checkdb idat $n)
      if test "$(iai-checkdb gsize $tgid)" -eq "1"\
	&& test "$tgid" -eq "$(( $id-deep+n ))"
      then
	eche "$FUNCNAME: Group-start $tgid (id=$id) (deep=$deep) (n=$n)"
	echo -n "$(str_repeat ' ' "$n") ${_color_in}GROUP"
	echo " $(iai-checkdb refof $tgid)${_color_no} ($tgid):"
      fi
    done
    # TEST PASS/FAIL REPORT
    local pre="$(str_repeat ' ' $lvl)$_color_in"
    # TODO GROUP-END REPORT?
    if iai-checkdb isgid $id; then pre+="GROUP"; else pre+="TEST"; fi
    echo -n "$pre ${name}${_color_no} ($id) "
    test "$sc" -eq "0" \
      && { echo -n "${_color_ok}PASS${_color_no}"; } \
      || { echo -n "${_color_ko}FAIL (code $sc)${_color_no}"; }
    echo ": $desc"
    # When arguments are provided...
    if test $# -gt 0; then
      echo >&2 "$FUNCNAME: TODO implementation of custom end failure message?"
    fi
    # make test runner "bail"
    test "$sc" -ne "0" && exit $sc
    return $sc # seems redudant: if gets executed, $sc is 0
  }

  ##
  # describes a test case, optionally providing the logic to run it.
  # When argument $2 leads to a routine:
  # - $1 is the subject (routine parameter $1)
  # - $2 is the keyword describing routine
  # - $3 and onwards are routine params (routine parameter $2 and onwards)
  # When argument $2 does not lead to a routine, $@ is the description
  iai-check-that () {
    iai-checkdb begin
    # Second argument can be a special word to trigger should-style interface
    case "$2" in
      is)
	local thing="${@:3}"
	iai-checkdb describe "'$1' should be $thing"
	case "$thing" in
	  'a command')
	    iai-checkdb desc " (so reachable through the \$PATH)"
	    which "$1" 1>/dev/null
	    iai-check end
	  ;;
	  *)
	    echo "Unknow _thing_ to perform 'is' test: '$thing'"
	    exit 1
	  ;;
	esac
      ;;
      #returns) iai-check-that-1-returns-2 "$1" "$3"; ;;
      ##
      # The check is deferred to an external command `check end` must run after
      *)
    if test $# -ge 2; then
      local routine="iai-check-that-1-$2-2"
      if type -t "$routine" &>/dev/null; then
	"$routine" "$1" "${@:3}"
	return
      fi
    fi
    iai-checkdb describe "$@" # Every argument is considered part of description
      ;;
    esac
  }
  iai-check-that-1-is-2 () {
    echo -n "$FUNCNAME:"; local args=("$@"); pretty_print_array_full args 
  }
  ##
  # checks that command line ($1) exit status code is equal to $2
  # - IMPORTANT: $1 is executed with `eval` to research the exit code
  # - stdout/stderr from `eval $1` are preserved/ignored depending on $2 value
  # - When $2==0 stdout is ignored and stderr is preserved
  # - When $2>=1 stdout is ignored and stderr is ignored too.
  # - A message is echoed to stdout when exit code does not match
  iai-check-that-1-returns-2 () {
    iai-checkdb describe "'$1' exit status code should be $2"
    ( # using eval to KISS - http://mywiki.wooledge.org/BashFAQ/050
      if test $2 -eq 0; then
      	( eval $1 ) 1>/dev/null ; # ignore stdout
      else
      	( eval $1 ) &>/dev/null ; # ignore stdout and stderr
      fi
      # eval in subshell to avoid premature exit triggered by eval'ed code
      code=$?
      if test $code -eq $2; then exit; fi # exit code is `test` exit code
      echo "The exit code was $code, while expecting $2."
      # explicity exit with code > 0 so `check end` reports failure
      exit 1
    )
    iai-check end
  }
  ##
  # checks that command line ($1) stdout is as described in $2
  # TODO
  # - The procedure should be writen to compare-by-character
  #   Using `diff` because the output from `cmp` is not descriptive enought
  # - should use --suppress-common-lines too?
  iai-check-that-1-outputs-2 () {
    iai-checkdb describe "\$($1) should equal '$2'"
    # using eval to KISS - http://mywiki.wooledge.org/BashFAQ/050
    diff --width=$(tput cols) --color=always <(eval $1) <(echo "$2")
    iai-check end
  }

  ##
  # call the iai-check routine, otherwise the 1st test will not run
  echo "running iai-check for the first time"
  iai-check "$@"
}
