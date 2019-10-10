# dirty, but working
function check-command--outputs () {
  local MODE EXPECT
  case "$1" in
    -command)
        echo "$FUNCNAME: bad usage, insuficient parameters" >&2
        exit 2
      ;;
    something|anything)
      EXPECT=$1; MODE='read -N 1'
      ;;
    nothing)
      EXPECT=$1; MODE='read -N 1 ; (($?))'
      ;;
    string)
      EXPECT="the string '$2'"
      MODE="read out; test \"\$out\" = '$2' && ! read -N 1"
      ;;
    stdin)
      EXPECT="same data read from stdin"
      test -t 0 && FAIL "stdin is a terminal"
      INPUT="$(cat)"
      MODE="my-custom-diff - <(echo $(printf %q "$INPUT"))"
      ;;
    *) echo "$FUNCNAME: invalid argv: $@" >&2; return 2 ;;
  esac

  local output="" n=0
  
  diag-msg () {
    printf '%2s | %s%s %s %s\n' $((++n)) "${1:-?}" "${4:->}" "$2" "${3:-<}"
  }
  diag () {
    local l
    while read l; do diag-msg $1 "$l" "$2" "$3"; unset -v l; done
    test -n "$l" && diag-msg $1 "$l" "<(no line break present)" "$3"
  } >&2

  if output="$( "${AUTOCMD[@]}" 2> >(diag 2) | eval "$MODE" )"
  then # test passed
    echo "PASS$( printf " '%s'" "${AUTOCMD[@]}") outputs $EXPECT"
    unset -f diag diag-msg
    return 0
  else
    echo "FAIL '${AUTOCMD[@]}' should output $EXPECT, but it does not"
    test -n "$INPUT" && diag 0 '>' '<' <<<"$INPUT"
    case "$1" in something|anything) ;; *)
      n=0
      if test -n "$output"; then
        diag 1 <<<"$output"
      else
        diag 1 <<<"$( "${AUTOCMD[@]}" 2>/dev/null )"
      fi
    esac
    echo CODE 1
    exit 1
  fi
}

function my-custom-diff () {
  diff -y --left-column -W 40 "$@"
  #diff -y --left-column --suppress-common-lines -W 80 --color=auto "$@"
}

##
# vim modeline
# Vim: set filetype=sh ts=2 shiftwidth=2 expandtab:
