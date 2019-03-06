
function find-examples () {
  local place=$1; shift
  find "$(autotest root)/example$place" -type f "$@" -print0 | sort -z
}

function assert-its-executable () {
  local FILE="${1:?'missing argument 1: filepath'}"
  if test -x "$FILE"; then
    echo "PASS $FILE is executable"
  else
    echo "FAIL $FILE should be executable, but it is NOT"
    test -e "$FILE" \
      && echo "PASS $FILE exists" \
      || echo "FAIL $FILE does not exist"
  fi
  unset FILE
}

function assert-example-status () {
  local EXAMPLE="${1:?'missing argument 1: example filepath'}"; shift
  local EXPECT="${@:?'missing options: expected exit status'}"
  autotest "$EXAMPLE" &>/dev/null
  local ACTUAL=$? RESULT
  test $ACTUAL $EXPECT; RESULT=$?
  !(( $RESULT )) && printf PASS || printf FAIL
  echo " $EXAMPLE returns exit status $ACTUAL (expected $EXPECT)"
  return $RESULT
}

function assert-example-last-code () {
  local EXAMPLE="${1:?'missing argument 1: example filepath'}"; shift
  local EXPECT="${@:?'missing options: expected exit status'}"
  local LAST_S="$(autotest "$EXAMPLE" 2>/dev/null | tail -1)"
  local REGEXP='^CODE [0-9]+.*$'
  if egrep "$REGEXP" <<<"$LAST_S" &>/dev/null
  then
    echo "PASS $EXAMPLE last statement matches $REGEXP"
  else
    echo "FAIL $EXAMPLE last statement '$LAST_S' does not match $REGEXP"
    return 1
  fi
  local KEY ACTUAL ETC
  read KEY ACTUAL ETC <<<"$LAST_S"
  #>&2 echo "debug $FUNCNAME: $EXAMPLE '$LAST_S' '$KEY' '$ACTUAL' '$ETC' $EXPECT"
  test $ACTUAL $EXPECT && printf PASS || printf FAIL
  echo " $EXAMPLE last CODE statement has code '$ACTUAL' (expected $EXPECT)"
  unset EXAMPLE EXPECT LAST_S KEY ACTUAL ETC
}

function assert-code-exists () {
  local CODE="${1:?'missing argument 1: code name or number'}"
  autotest code $CODE &>/dev/null \
    && echo "PASS code $CODE is $(autotest code $CODE)" \
    || { echo "FAIL 'autotest code $CODE' produces exit status $?"; return 1; }
  unset CODE
}

function assert-all-codes-are () {
  if test -t 0; then
    echo "FAIL $FUNCNAME must be run within a pipe"
    return 2
  fi
  local CODE="${1:?'missing argument 1: code name'}"
  autotest code $CODE &>/dev/null || {
    echo "FAIL 'autotest code $CODE' produces exit status $?"
    return 2
  }
  local EXPECT=$(autotest code $CODE)
  while IFS= read -d '' EXAMPLE; do
    assert-its-executable "$EXAMPLE"
    assert-example-status "$EXAMPLE" -eq "$EXPECT"
    assert-example-last-code "$EXAMPLE" -eq "$EXPECT"
  done
  unset CODE EXPECT
}
