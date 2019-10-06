# dirty, but working
function check-command--outputs () {
  if test "$1" == '--'; then # no params received 
    >&2 echo "$FUNCNAME what should command output? nothing specified"
    return 2
  fi
  local MODE EXPECT
  while (($#)); do
    case "$1" in
      --) shift; break ;;
      #/*) MODE=diff shift ;;
      something) EXPECT=something; shift; MODE='read -N 1' ;;
      nothing)   EXPECT=nothing  ; shift; MODE='read -N 1 ; (($?))' ;;
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
      *) >&2 echo "$FUNCNAME: invalid argv: $@"; return 2 ;;
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
