
function dry-nonvoid () {
  for var in "$@"; do
    test -v "$var" || FAIL "variable '$var' is not defined"
    test -z "${!var}" && FAIL "variable '$var' is void/empty"
  done
}

function dry-defined () {
  for var in "$@"; do
    test -v "$var" || FAIL "variable '$var' is not defined"
  done
}

function dry-assert-code () {
  dry-nonvoid 'case' 'code'
  test "$code" -eq "${1:?missing expected code}" && {
    PASS "$case code is $1"
  } || {
    FAIL --next "$case code should be $1, but is $code"
    for o in {output,stdout,stderr}; do
      test -n "${!o}" && dry-diagnose "$o"
    done
    exit 1
  }
}

function dry-diagnose () {
  dry-defined "${1:?missing output variable name}"
  n=0; while read l; do
    printf '%2s | %s: %s\n' "$((++n))" "${1#std}" "$l"
  done <<<"${!1}" >&2
  code=1
}
function dry-assert-output () {
  dry-nonvoid 'case'
  dry-defined "${1:?missing output variable name}"
  test -n "${!1}" && {
    PASS "$case $1 has data"
  } || {
    FAIL --next "$case $1 should have data"
    return 1
  }
}
function dry-refute-output () {
  dry-nonvoid 'case'
  dry-defined "${1:?missing output variable name}"
  test -z "${!1}" && {
    PASS "$case $1 has no data"
  } || {
    FAIL --next "$case $1 should have no data"
    dry-diagnose "$1"
    return 1
  }
}

function dry-assert-function () {
  local fname="${1:?missing function name}"
  dry-defined 'case'
  test "$(type -t "$fname")" = 'function' && {
    PASS "$case defines function '$fname'"
  } || {
    FAIL "$case should define function '$fname'"
  }
}

function dry-assert-equality () {
  dry-defined 'case'
  test "${1:?missing actual value}" = "${2:?missing expect value}" && {
    PASS "$case value is '$2'"
  } || {
    caller 0 >&2
    FAIL "$case value should be '$2', but is '$1'"
  }
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
