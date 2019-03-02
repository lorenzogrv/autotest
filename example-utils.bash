
function find-examples () {
  local place=$1; shift
  find "$(autotest root)/example$place" -type f "$@" -print0 | sort -z
}

function assert-its-executable () {
  local FILE="${1:?'missing argument 1: filepath'}"
  test -x "$FILE" \
    && echo "PASS $FILE is executable" \
    || echo "FAIL $FILE should be executable, but it is NOT"
  unset FILE
}

function assert-example-status () {
  local EXAMPLE="${1:?'missing argument 1: example filepath'}"; shift
  local EXPECT="${@:?'missing options: expected exit status'}"
  autotest "$EXAMPLE" &>/dev/null
  local ACTUAL=$?
  test $ACTUAL $EXPECT && printf PASS || printf FAIL
  echo " $EXAMPLE returns exit status $ACTUAL (expected $EXPECT)"
  unset EXAMPLE EXPECT ACTUAL
}

function assert-example-last-code () {
  local EXAMPLE="${1:?'missing argument 1: example filepath'}"; shift
  local EXPECT="${@:?'missing options: expected exit status'}"
  local LAST_S="$(autotest "$EXAMPLE" 2>/dev/null | tail -1)"
  local REGEXP='^CODE [0-9]+$'
  if egrep "$REGEXP" <<<"$LAST_S" &>/dev/null
  then
    echo "PASS $EXAMPLE last statement matches $REGEXP"
  else
    echo "FAIL $EXAMPLE last statement is '$LAST_S'"
    return 
  fi
  local KEY ACTUAL ETC
  read KEY ACTUAL ETC <<<"$LAST_S"
  #>&2 echo "debug $FUNCNAME: $EXAMPLE '$LAST_S' '$KEY' '$ACTUAL' '$ETC' $EXPECT"
  test $ACTUAL $EXPECT && printf PASS || printf FAIL
  echo " $EXAMPLE last CODE statement has code '$ACTUAL' (expected $EXPECT)"
  unset EXAMPLE EXPECT LAST_S KEY ACTUAL ETC
}
