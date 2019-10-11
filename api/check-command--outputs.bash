# dirty, but working
function check-command--outputs () {
  local expect
  case "$1" in
    something|anything|nothing) expect=$1 ;;
    string)
      test $# -eq 2 || {
        echo "$FUNCNAME: invalid argv: expecting 2 arguments"
        exit 2
      } >&2
      expect="the string $(printf '%q' "$2")"
      ;;
    stdin)
      expect="the data read from stdin"
      test -t 0 && FAIL "stdin is a terminal"
      INPUT="$(cat)"
      test -z "$INPUT" && {
        echo EUSAGE "stdin is empty, use 'nothing' instead" >&2
        exit 2
      }
      ;;
    *) echo "$FUNCNAME: invalid argv: $@" >&2; exit 2 ;;
  esac

  local stdout="$FUNCNAME.stdout" stderr="$FUNCNAME.stderr"
  exec 3<> $stderr
  exec 4<> $stdout
  case "$1" in
    something|anything) ;; # don't need all output
    nothing|string|stdin) ("${AUTOCMD[@]}") 1>&4 2>&3 ;;
  esac
  exec 4>&-

  local probe diff
  case "$1" in
    something|anything) ("${AUTOCMD[@]}") 2>&3 | read -N 1 ;;
    nothing) read -N 1 < $stdout || read -N 1 < $stderr; (($?)) ;;
    string) diff="$(< $stdout)"; test "$diff" = "$2" ;;
    stdin) diff="$( my-custom-diff $stdout - <<<"$INPUT" 2>&3 )" ;;
  esac
  probe=$? # 0 means success, > 0 is failure
  
  local topic="$( printf ' %q' "${AUTOCMD[@]}" )"; topic="'${topic# }'"
  if (( $probe ))
  then
    echo "FAIL $topic should output $expect"
  else
    echo "PASS $topic outputs $expect"
  fi
 
  if (( $probe ))
  then
    local n=0
    test -n "$INPUT" && { diag 0 '>' '<' <<<"$INPUT"; n=0; }
    if test -n "$diff"
    then diag 1 <<<"$diff"
    elif test "$(cat $stdout)" != ''
    then 
      diag 1 < $stdout
      #diag-msg 1 "$(cat $stdout)"
    else # last resort: print the character we now is there
      read -N 1 thing < $stdout && diag-msg 1 "${thing}" 
      #/$'\n'/(newline character)}" >&2
    fi
    n=0
    diag 2 < $stderr
  fi

  # teardown logging machinery
  exec 3>&-; rm $stderr
  exec 4>&-; rm $stdout

  # now exit/whatever it's need to do
  test $probe -gt 0 && { echo CODE $probe; exit $probe; }
  return 0
}

function my-custom-diff () {
  diff -y --left-column -W 40 "$@"
  #diff -y --left-column --suppress-common-lines -W 80 --color=auto "$@"
}

##
# vim modeline
# Vim: set filetype=sh ts=2 shiftwidth=2 expandtab:
