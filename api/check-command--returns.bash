# dirty, but working
function check-command--returns () {
  if test "$1" == '--'; then # no params received 
    >&2 echo "$FUNCNAME what should command return? nothing specified"
    return 2
  fi
  local EXPECT
  while (($#)); do
    case "$1" in
      --) shift; break ;;
      -eq|-ne|-gt|-ge|-lt|-le) EXPECT="$1 $2"; shift 2 ;;
      [0-9]|[1-9][0-9]|[1-2][0-9][0-9]) EXPECT="-eq $1"; shift ;;
      zero) EXPECT="-eq 0"; shift ;;
      nonzero|non-zero) EXPECT="-ne 0"; shift ;;
      *) >&2 echo "$FUNCNAME: invalid argv: $@"; return 2 ;;
    esac
  done
  # hereafter, argv should only contain the command line to be run
  { "$@"; } &>/dev/null; local ACTUAL=$?
  test $ACTUAL $EXPECT && printf PASS || printf FAIL
  echo " '$@' returns $ACTUAL (expecting $EXPECT)"
  test $ACTUAL $EXPECT # return $?
}
##
# vim modeline
# Vim: set filetype=sh ts=2 shiftwidth=2 expandtab:
