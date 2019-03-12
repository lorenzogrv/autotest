
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
    return 1
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

function assert-correct-output () {
  local EXAMPLE="${1:?'missing argument 1: example filepath'}"; shift
  local TESTOUT="$(autotest "$EXAMPLE" 2>/dev/null)"

  # any correct standard output must begin with TEST, and end with CODE
  { <<<"$TESTOUT" head -1 | egrep '^TEST .+' >/dev/null; } \
    && echo "PASS $EXAMPLE output begins with a TEST statement" \
    || echo "FAIL $EXAMPLE output begins with '$(<<<"$TESTOUT" | head -1)'"
  { <<<"$TESTOUT" tail -1 | egrep '^CODE .+' >/dev/null; } \
    && echo "PASS $EXAMPLE output ends with a CODE statement" \
    || echo "FAIL $EXAMPLE output ends with '$(<<<"$TESTOUT" | head -1)'"

  local COUNT=0 TLINE TCMD CLINE UNIT
  <<<"$TESTOUT" grep -n '^TEST' | while IFS=':' read TLINE TCMD
  do
    let COUNT++
    TCMD="${TCMD##'TEST '}"
    # any correct TEST statement must provide the command issuing the test
    if test -n "$TCMD"
    then
      echo "PASS $EXAMPLE TEST $COUNT @ line $TLINE provides a command"
    else
      echo "FAIL missing TEST command in '$(tail -n +$TLINE | head -1)'"
      return 1
    fi
    # any correct TEST unit is closed after TEST statement by a CODE statement
    CLINE=$(<<<"$TESTOUT" grep -n '^CODE' | cut -d':' -f1 \
      | while read N; do test $N -gt $TLINE || continue; echo $N; break; done
    )
    if test -n "$CLINE"
    then
      echo "PASS $EXAMPLE TEST $COUNT ends with CODE statement @ line $CLINE"
    else
      echo "FAIL '$(<<<"$TESTOUT" tail -n +$TLINE | head -1)' doesn't end!"
      return 1
    fi
    # any correct TEST unit output is reproducible issuing its command
    UNIT=$( <<<"$TESTOUT" tail -n +$TLINE | head -n $((CLINE-TLINE+1)) )
    # <<<"$UNIT" >&2
    if { diff -y -W 72 --color=auto <(autotest $TCMD 2>/dev/null) - <<<"$UNIT"
       } 1>&2
    then
      echo "PASS $EXAMPLE TEST $COUNT is reproducible with 'autotest $TCMD'"
    else
      echo "FAIL can't reproduce '$(<<<"$TESTOUT" tail -n +$TLINE | head -1)'"
      return 1
    fi
  done
  # any correct standart output must have at least one TEST unit
  if (($COUNT))
    then echo "PASS $EXAMPLE outputs $COUNT TEST statement(s)"
    else echo "FAIL $EXAMPLE doesn't output any TEST statements"; return 1
  fi

  echo "SKIP checking the stderr"
}

##
# vim modeline
# Vim: set filetype=sh ts=2 shiftwidth=2 expandtab:
