# dirty, but working
function check-command--outputs () {
  if test "$1" == '-command'; then # no params received 
    echo "$FUNCNAME: bad usage, insuficient parameters"
    return 2
  fi >&2

  local MODE EXPECT
  while (($#)); do
    case "$1" in
      -command) shift; break ;;
      #/*) MODE=diff shift ;;
      something|anything) EXPECT=$1; shift; MODE='read -N 1' ;;
      nothing) EXPECT=$1; shift; MODE='read -N 1 ; (($?))' ;;
      string)
        EXPECT="given string ($2)"
        MODE="my-custom-diff - <(cat <<<\"$2\")"
        shift 2
        ;;
      same-as-file)
        EXPECT="contents of file $2"
        MODE="my-custom-diff - \"$2\""
        shift 2
        ;;
      *) echo "$FUNCNAME: invalid argv: $@" >&2; return 2 ;;
    esac
  done
  # hereafter, argv should only contain the command line to be run
  if "$@" 2>/dev/null | eval "$MODE" >&2
  then # test passed
    echo "PASS '$@' outputs $EXPECT"
    return 0
  else
    echo "FAIL '$@' should output $EXPECT, but it does not"
    return 1
  fi
}

function my-custom-diff () {
  diff -y --left-column -W 80 --color=auto "$@"
}

##
# vim modeline
# Vim: set filetype=sh ts=2 shiftwidth=2 expandtab:
