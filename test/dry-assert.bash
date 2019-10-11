
function dry-nonvoid () {
  for var in "$@"; do
    test -v "$var" || FAIL "variable '$var' is not defined"
    test -z "${!var}" && FAIL "variable '$var' is void/empty"
  done
}

function dry-defined () {
  for var in "$@"; do
    test -v "$var" || FAIL "variable '$var' is not defined"
    test "${!var}" = "${!var}" || FAIL "variable name invalid"
  done
}

function dry-diagnose () {
  dry-defined "${1:?missing output variable name}"
  n=0; while read l; do
    printf '%2s | %s: %s\n' "$((++n))" "${1#std}" "$l"
  done <<<"${!1}" >&2
}
function dry-diagnose-all () {
  variables=({stdout,stderr,code})
  while (($#)); do
    case "$1" in stdout|stderr|code) ;; *)
      dry-defined "$1"
      variables+=("$1")
    esac
    shift
  done
  for o in "${variables[@]}"; do
    test -n "${!o}" && dry-diagnose "$o"
  done
  echo CODE 1
  exit 1
}

function dry-assert-code () {
  dry-nonvoid 'case' 'code'
  test "$code" -eq "${1:?missing expected code}" && {
    PASS "$case \$code is $1"
  } || {
    FAIL --next "$case \$code should be $1, but is $code"
    dry-diagnose-all
  }
}

function dry-assert-output () {
  dry-nonvoid 'case'
  dry-defined "${1:?missing output variable name}"
  test -n "${!1}" && {
    PASS "$case \$$1 has data"
  } || {
    FAIL --next "$case \$$1 should have data"
    dry-diagnose-all "$1"
  }
}
function dry-refute-output () {
  dry-nonvoid 'case'
  dry-defined "${1:?missing output variable name}"
  test -z "${!1}" && {
    PASS "$case \$$1 has no data"
  } || {
    FAIL --next "$case \$$1 should have no data"
    dry-diagnose-all "$1"
  }
}

function dry-assert-function () {
  local fname="${1:?missing function name}"
  dry-nonvoid 'case'
  test "$(type -t "$fname")" = 'function' && {
    PASS "$case '$fname' is a function"
  } || {
    FAIL --next "$case '$fname' should be a function"
    functions="$(declare -F)"
    dry-diagnose-all "functions"
  }
}

function dry-assert-equality () {
  dry-nonvoid 'case'
  value="${3:-unespecified value}"
  test "${1:?missing actual value}" = "${2:?missing expect value}" && {
    PASS "$case '$value' is '$2'"
  } || {
    FAIL "$case '$value' should be '$2', but is '$1'"
  }
}

function dry-assert-line-count () {
  dry-nonvoid 'case'
  dry-defined "${1:?missing output variable name}"
  case "${2:?missing expected line count}" in
    0) dry-refute-output "$1"; return $? ;; #as wc -l will report 1 line
    *) # wc -l will report 1 line for empty variables
      test -z "${!1}" && {
        FAIL --next "$case \$$1 should have $2 data line(s), but is empty"
        dry-diagnose-all "$1"
      } ;;
  esac
  local count="$( wc -l <<<"${!1}" )"
  test "$count" -eq "$2" && {
    PASS "$case \$$1 has $2 data line(s)"
  } || {
    FAIL --next "$case \$$1 should have $2 data line(s), but has $count"
    dry-diagnose-all "$1"
  }
}
function dry-assert-grep-count () {
  dry-nonvoid 'case'
  dry-defined "${1:?missing output variable name}"
  local expect="${2:?missing expected line matches number}"
  (( $# > 2 )) || FAIL EUSAGE "no arguments for egrep"

  local count="$( egrep "${@:3}" <<<"${!1}" | wc -l )" 
  test "$count" -eq "$2" && {
    PASS "$case \$$1 matches 'egrep ${@:3}' $2 time(s)"
  } || {
    FAIL --next "$case \$$1 should match 'egrep ${@:3}' $2 times, but matches $count"
    dry-diagnose-all "$1"
  }
}

function dry-assert-flow-exits () {
  # usage: [function_name] [argv]{1,n}
  ( #avoid pollution with subshell
    cmd="$(printf " %s" "$@")"; cmd="\`${cmd# }\`"
    stdout="$( "$@" &>/dev/null; echo next)"
    code=$?
    test "$code" -eq 0 && {
      FAIL --next "$cmd code should not be 0"
    } || {
      PASS "$cmd code is not 0, is $code"
    }
    test "$stdout" = 'next' && {
      FAIL "$cmd should exit subshell"
    } || {
      PASS "$cmd exits subshell"
      code=0
    }
    exit $code
  )
  (( $? )) && exit 1
}
function dry-assert-flow-continues () {
  # usage: [function_name] [argv]{1,n}
  ( #avoid pollution with subshell
    cmd="$(printf " %s" "$@")"; cmd="\`${cmd# }\`"
    stdout="$( "$@" >/dev/null; echo next)"
    code=$?
    test "$code" -ne 0 && {
      FAIL --next "$cmd code should be 0, but is $code"
    } || {
      PASS "$cmd code is 0"
    }
    test "$stdout" != 'next' && {
      FAIL --next "$cmd should continue running subshell"
    } || {
      PASS "$cmd continues subshell"
    }
    exit $code
  )
  (( $? )) && { echo CODE 1; exit 1; }
}

#YAGNI
#function dry-assert () {
#  # usage: [test expression]{1,n} [varname]
#  local exp var
#  exp=(); while (($# < 2)); do exp+=("$1"); shift; done
#  var="$1" # TODO assert variable has been set
#  "$exp" && echo "PASS $case"
#}

##
# vim modeline (see vim +'help modeline')
# /* vim: set expandtab: */
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
