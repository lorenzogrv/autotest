
function assert () {
  EUSAGE "missing implementation";
}

##
## AUTOTEST BASICS (0ld API style)
##
## 0ld API is more a coding style than a true API, but still allows kind of
## _writting less_ while _doing more_, resulting in leaner code at tests.
##
## ```
## test something-is-as-expected \
##   || FAIL "the thing should be as it is expected to be"
## echo PASS "the thing is as it is expected to be"
## ```
##

function FAIL () {
  # echoes FAIL statement, dumps diagnose information, and puts CODE
  # usage: FAIL [REASON]
  # when no $code value is present, or $code is 0, will force CODE 1
  local diag=
  test "$1" = "--diag" && diag="$2" && shift 2
  if test -z "$*"; then
    echo "$FUNCNAME @0rigin: bad usage: no reason specified" >&2
    exit 2
  fi
  echo FAIL "$@"
  false && for ((a=1; a < ${#FUNCNAME[@]}; a++))
  do
    echo "   @ ${FUNCNAME[a]} +${BASH_LINENO[a-1]} ${BASH_SOURCE[a]}"
  done >&2
  if test -n "$diag"; then
    for var in ${diag//,/ }; do
      DIAG "$var"
    done
  else
    false && for var in {case,stdout,stderr,output,code}; do
      test -n "${!var}" && DUMP "   | ${var/std/ }:" <<<"${!var}"
    done
  fi
  (( $code )) && CODE $code || CODE 1
}

function CODE () {
  # echoes CODE statement and immediately exits subshell environment
  # usage: CODE [STATUS]? [..ARGV}
  # exit code is the specified [STATUS], or the last known code ($?)
  # usual: called by TEST() once unit() is done and returns
  # valid exit status codes range from 0 to 255
  code="${1:-$?}"
  if ! test "$code" -lt 256 2>/dev/null; then
    echo "$FUNCNAME @0rigin: invalid exit status code: $code" >&2
    code=3
  else
    echo CODE $code "by ${FUNCNAME[1]}() from ${FUNCNAME[2]}()"
  fi
  exit $code
}

function DUMP () {
  # echoes any data it reads to stderr, prefixed with received argv
  # usage: DUMP [PREFIX]? <<<"[DATA]"
  # returns success when data was output
  local line probe=0
  while IFS= read line; do
    echo "$@" "$line" "<"
    probe=1
  done
  test "$line" != '' \
    && echo "$@" "$line" "<(no line break present)" \
    || (( $probe )) # returns success when probe > 0
} >&2

function DIAG () {
  # writes diagnose information to stderr for each variable [NAME] given
  # usage: DIAG [NAME1] ..[NAMEn]
  # [NAME] values stdin,stdout,stderr,output are prefixed as 0<,1>,2>,&>
  local count dname
  for var in "$@"; do
    count="$(wc -l <<<"${!var}")"
    dname="${var#std}"
    if test "$var" != "${var#std}" || test "$var" != "${var#output}"
    then
      dname="${var/stdin/0<}"
      dname="${dname/stdout/1>}"
      dname="${dname/stderr/2>}"
      dname="${dname/output/&>}"
    else
      dname="$var:"
    fi
    DUMP "   |" "$dname" <<<"${!var}"
  done
}

##
## BASIC EXPECT ASSERTIONS (they don't write PASS statements to stdout)
##

function expect-exists () {
  # asserts each [VARIABLE] name given is active on subshell
  # usage: assert-exists [VARIABLE]{1,n}
  # useful within unit() or assert-X functions to assert presence of variables
  test $# -gt 0 || FAIL "$FUNCNAME: no [VARIABLE] names given"
  for var in "$@"; do
    test -v "$var" \
      || FAIL "variable '$var' should be active at shell lvl $BASH_SUBSHELL"
  done
}

function expect-params () {
  # asserts each [VARIABLE] name given is active and not empty on subshell
  # usage: assert-params [VARIABLE]{1,n}
  # useful within unit() or assert-X to assert environment parameters are set
  expect-exists "$@"
  for var in "$@"; do
    test -n "${!var}" \
      || FAIL "variable '$var' should have value at shell lvl $BASH_SUBSHELL"
  done
}

##
## ATP BASIC ASSERTIONS (they write PASS statements on stdout, no dependencies)
##

function assert-type-t () {
  # asserts the [COMMAND] name given has [TYPE] on subshell (type -t equality)
  # usage: assert-type-t [COMMAND] [|alias|keyword|function|builtin|file]
  # useful within unit() to assert a command has specified type, or no type
  test $# -eq 2 || {
    EUSAGE "$FUNCNAME: expecting exactly 2 parameters"
    exit 2
  }
  test "$(type -t "$1")" = "$2" || {
    echo FAIL "at shell lvl $BASH_SUBSHELL, $1 should have ${2:-no} type"
    exit 1
  }
  echo PASS "at shell lvl $BASH_SUBSHELL, $1 has ${2:-no} type"
}

function refute-existance () {
  # asserts each [COMMAND] name given has no type at subshell (type='')
  # usage: refute-existance [COMMAND]{1,n}
  # useful within unit() to assert commands are not found at subshell
  test $# -gt 0 || FAIL "$FUNCNAME: expecting at least 1 parameter"
  for name in "$@"; do assert-type-t "$name" ''; done
}

function assert-functions () {
  # asserts each [COMMAND] name given has function type at subshell
  # usage: assert-functions [COMMAND]{1,n}
  # useful within unit() to assert commands are functions at subshell
  test $# -gt 0 || FAIL "$FUNCNAME: expecting at least 1 parameter"
  for name in "$@"; do assert-type-t "$name" 'function'; done
}

##
## ATP EXECUTION FLOW ASSERTIONS (they write PASS statements on stdout)
##

function assert-flow-finish () {
  # asserts [COMMAND] [ARGV] "exits", halting the subshell execution 
  # usage: assert-flow-finish [COMMAND] [ARGV]{0,n}
  local t=$(type -t "$1")
  case "$t" in file|'')
    FAIL "\$@ cannot halt the subshell because '$1' has ${t:-no} type"
  esac
  test "$( "$@" &>/dev/null; echo next )" != 'next' \
    || FAIL "command \$@ should halt the subshell"
  echo PASS "command \$@ halts the subshell"
}
function refute-flow-finish () {
  # asserts [COMMAND] [ARGV] resumes subshell execution upon completion
  # usage: refute-flow-finish [COMMAND] [ARGV]{0,n}
  test "$( "$@" &>/dev/null; echo next )" = 'next' \
    || FAIL "command \$@ should not halt the subshell"
  echo PASS "command \$@ does not halt the subshell"
}

##
## BASIC ATP CONTENT ASSERTIONS (they write PASS statements on stdout)
##

function assert-output () {
  # asserts the variable [NAME] exists and has content (test -n)
  # usage: assert-output [NAME]
  # useful within unit() to assert presence of parameter/output values
  expect-exists "${1:?missing [NAME]}"
  test -n "${!1}" \
    || FAIL "\$$1 should have data"
  echo PASS "\$$1 has data"
}

function refute-output () {
  # asserts the variable [NAME] exists and has no content (test -z)
  # usage: assert-output [NAME]
  # useful within unit() to assert absence of parameter/output values
  expect-exists "${1:?missing [NAME]}"
  test -z "${!1}" \
    || FAIL --diag $1 "\$$1 should have no data"
  echo PASS "\$$1 has no data"
}

function assert-equals () {
  # asserts the variables [NAME] and [EXPECT] exist and are equal (test =)
  # usage: assert-output [NAME] [EXPECT]
  # useful within unit() to assert equality between parameter/output values
  expect-exists "${1:?missing [NAME]}" "${2:?missing [EXPECT]}"
  test "${!1}" = "${!2}" \
    || FAIL --diag "$1","$2" "\$$1 should be equal to \$$2"
  echo PASS "\$$1 is equal to \$$2"
}

function assert-status () {
  # asserts the variable $status exists and is (numerically) equal to [CODE]
  # usage: assert-status [CODE]
  # useful within unit() to assert conformance with specific exit status code
  expect-exists 'status'
  test "$status" -eq "${1:?missing [EXPECTED_CODE]}" \
    || FAIL "\$status should be $1, but is $status"
  echo PASS "\$status is $1"
}

##
## ADVANCED CONTENT ASSERTIONS
##

function assert-line-count () {
  # asserts variable [NAME] exists and contains [COUNT] lines (wc -l)
  # usage: assert-line-count [NAME] [COUNT]
  expect-exists "${1:?missing [NAME]}"
  case "${2:?missing [COUNT]}" in
    0) refute-output "$1"; return $? ;; #as wc -l will report 1 line
    *) # the wc -l test will report 1 line when feeding in empty variables
      test -n "${!1}" \
        || FAIL "\$$1 should have $2 data line(s), but is empty"
      ;;
  esac
  local count="$( wc -l <<<"${!1}" )"
  test "$count" -eq "$2" \
    || FAIL --diag $1 "\$$1 should have $2 data line(s), but has $count"
  echo PASS "\$$1 has $2 data line(s)"
}

function assert-grep-count () {
  # asserts variable [NAME] exists and contains [COUNT] lines matching [ARGV]
  # usage: assert-grep-count [NAME] [COUNT] [ARGV]{1,n}
  # test is performed via 'wc -l | grep -E [ARGV]{1,n}'
  expect-params "${1:?missing [NAME]}"
  local expect="${2:?missing [COUNT]}"
  (( $# > 2 )) || EUSAGE "no arguments for egrep" || exit 2

  local count="$( grep -E "${@:3}" <<<"${!1}" | wc -l )" 
  test "$count" -eq "$2" \
    || FAIL --diag $1 \
    "\$$1 should match '${@:3}' $2 times, but matches $count"
  echo PASS " \$$1 matches '${@:3}' $2 time(s)"
}

function assert-grep-every () {
  # asserts variable [NAME] exists, has content, and every line matches [ARGV]
  # usage: assert-grep-every [NAME] [ARGV]{1,n}
  # matching is performed via grep -E
  expect-params "${1:?missing [NAME]}"
  (( $# > 1 )) || EUSAGE "no arguments for grep -E" || exit 2

  local var="$1"; shift
  local m=$( grep -E "$@" <<<"${!var}" | wc -l )
  local c=$( wc -l <<<"${!var}" )

  #TODO diag diff{ egrep -v "$expect" <<<"$stdout"; } >&2
  test "$m" -eq "$c" \
    || FAIL "\$$var every line ($c) should match $@, but only $m match"
  echo PASS "\$$var every line ($c) matches $@"
}

##
# vim modeline (see vim +'help modeline')
# /* vim: set expandtab: */
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
