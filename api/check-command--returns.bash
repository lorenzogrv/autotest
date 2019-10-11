# dirty, but working
function check-command--returns () {
  (( $# )) || {
    echo "$FUNCNAME: EUSAGE: specify either one or two parameters"
    exit 2
  } >&2
  
  local expect operator
  case "$1" in
    -eq|-ne|-gt|-ge|-lt|-le) operator="$1"; expect="$2"; shift ;;
    zero) operator="-eq"; expect=0 ;;
    nonzero|non-zero) operator="-ne"; expect=0 ;;
    *) operator="-eq"; expect="$1" ;;
  esac

  case "$expect" in
    [0-9]|[1-9][0-9]|[1-2][0-9][0-9])
      test $expect -lt 256 || {
        echo "$FUNCNAME: invalid exit code '$@'" >&2
        exit 2
      }
    ;;
    *) echo "$FUNCNAME: EUSAGE: invalid argv: $@" >&2; exit 2 ;;
  esac

  test $# -eq 1 || {
    echo "$FUNCNAME: EUSAGE: too much parameters"
    exit 2
  } >&2
    
  local topic="$( printf ' %q' "${AUTOCMD[@]}" )"; topic="'${topic# }'"
  local speech
  case ${operator#-} in
    eq) speech="$expect";;
    ne) speech="anything but $expect" ;;
    lt) speech="lower than $expect" ;;
    gt) speech="greater than $expect" ;;
    le) speech="$expect or lower" ;;
    ge) speech="$expect or greater" ;;
  esac

  local actual stderr
  stderr="$( "${AUTOCMD[@]}" 2>&1 1>/dev/null)"
  actual=$?

  test $actual $operator $expect && {
    echo PASS "$topic return code is $speech"
  } || {
    echo FAIL "$topic return code should be $speech, not $actual"
    test -n "$stderr" && diag 2 <<<"$stderr"
    echo CODE 1
    exit 1
  }
  return 0 #be explicit
}

##
# vim modeline
# Vim: set filetype=sh ts=2 shiftwidth=2 expandtab:
