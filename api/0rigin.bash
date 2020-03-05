#!/bin/bash

# this is the autotest 0rigin, which abstracts an "interface" for test scripts
# this -kind of- interface is meant to be reused at test scripts

# it has no dependencies because everything is nothing at 0rigins
# TODO actually, it should depend on autotest (FAIL, CODE, EUSAGE, ENOENT...)
# it tests nothing, because everything is nothing at 0rigins

function MAIN () {
  # begins test execution flow at the script end
  # usage: (help|grep|only=[UNIT] [halt]?|unit=[UNIT][..key=value] ..ARG)?
  # commanded by [TEST_FILE] "$@", see [TEST_FILE] help
  # usual: [TEST_FILE] only=[UNIT], [TEST_FILE] help
  # @spec: "$BASH_SOURCE" = "$0" && MAIN "$@" || return 0
  case "$1" in
    -h|help) HELP "$@" ;; # greps help from source, try: help usage
    -d|desc) grep -E --color "[A-Z0-9]+) #" <"$0" ;; # describes [UNIT] names
    -e|enum) MAIN -d | while read -d \) u; do echo $u; read; done ;;
    ''|halt) main "$1" ;; # main() calls UNIT() for each [UNIT] enumerated
    only=?*) UNIT "$@" ;; # UNIT() calls only() after CASE() is defined
    unit=?*) TEST "$@" ;; # TEST() calls unit() after consuming keys=values

    # output for humans:
    grep) shift; MAIN "$@" | egrep --color "^(TEST|FAIL .+|CODE [^0]+)";;
    todo) shift; MAIN "$@" | egrep --color "^(TEST|FAIL .+|SKIP .+)";;
    test) shift; MAIN "$@" 2>&1 | egrep --color "^(UNIT )?(TEST .+|FAIL .+|)";;

    *) (MAIN -h) >&2; echo "$0: invalid parameter: '$1'" >&2; exit 2 ;;
  esac
  exit $? # 0=OK, 1=FAIL, greater is error
}

function main () {
  # runs all tests at current script, halts at first failure on demand
  # usage: [TEST_FILE] [halt]?
  # commanded by MAIN() when the script runs bare or 'halt'
  # usual: ...
  # by default, commands MAIN() unit=[UNIT] for each [UNIT] in MAIN() enum
  local codes=0
  for cases in $(MAIN -e); do
    ( UNIT only=$cases $1 )
    let codes+=$?
    test "$1" = 'halt' && test $codes -gt 0 && exit $codes
  done
  (MAIN -d) >/dev/null || {
    echo ENOENT "no [UNIT](s) are described at $0"
    exit 127
  } >&2
  test $codes -eq 0; return $?
}

function UNIT () {
  # prepares suitable environment to run only the specified UNIT test cases
  # usage: [TEST_FILE] only=[UNIT] [halt]?
  # commanded by MAIN(), defines $only (uppercased [UNIT]) and CASE() function
  # usual: this function commands only() to run [UNIT] cases with CASE()
  # by default, CASE() commands TEST() unit=$only "$@"
  local only="${1#only=}"; only="${only^^}"
  (MAIN -e) | grep -q "$only" || {
    echo ENOENT: "$0: $FUNCNAME() @Origin: unit '$only' not found"
    exit 127
  } >&2
  local halt="$2"
  local codes=0
  function CASE () {
    ( TEST unit=$only "$@" )
    let codes+=$?
    test "$halt" = 'halt' && test $codes -gt 0 && exit $codes
    return 0
  }
  only "$only" # controls what cases to run via constant uppercase names
  test $? -eq 0 && test $codes -eq 0 #;return $?
}

function only () {
  # interface to run **only** specified unit test cases, via CASE()
  # usage: [TEST_FILE] only=[UNIT]
  # this function is called by UNIT() after CASE() is defined
  # usual: CASE(..[ARGV]) or reuse tests with: autotest [LAYER] ..[ARGV]
  # this function should be implemented at test scripts
  EUSAGE=EUSAGE
  type $EUSAGE &>/dev/null || EUSAGE="echo $BASH_SOURCE: EUSAGE:"
  $EUSAGE "$FUNCNAME() should be implemented at test scripts" >&2
  return 2
}

function TEST () {
  # echoes the TEST statement and immediately runs the **unit** test
  # usage: [TEST_FILE] unit=[UNIT] (param=[value]){0,n} ..[ARGV]{0,n}
  # commanded by MAIN(), defines parameters as variables for later usage
  # note: consumes all **leading** key=value params
  local stdin # TODO decide: -r?
  test -t 0 && stdin="" || stdin="$(cat)"
  echo TEST "$0$(printf ' %q' "$@")" "<<<$(printf %q "$stdin")"

  # consume argv's leading key=value parameters
  for v in "$@"; do
    # TODO decide: declare -r?
    case "$v" in ?*=*) declare "${v%=*}=${v#*=}";; *) break;; esac
    case "${v%=*}" in stdin|stdout|stderr|output|status)
      echo "$FUNCNAME: invalid key=value argument name: $v" >&2
      exit 2
    esac
    shift
  done

  # unit=[UNIT] is mandatory
  test -z "$unit" && {
    echo EUSAGE: "$0: $FUNCNAME() @0rigin: no specified unit"
    exit 2
  } >&2
  # [UNIT] must be on MAIN's enum
  MAIN -e | grep -q "$unit" || {
    echo ENOENT: "$0: $FUNCNAME() @Origin: MAIN() does not enumerate unit "
    exit 127
  } >&2

  # key=value parameter hooks
  for hook in $(declare -F | cut -d ' ' -f 3 | grep -E "TEST\..+")
  do
    $hook "$@" || {
      echo "$hook(\$@) should return code 0, but returns $?"
      exit 1
    } >&2
  done

  echo DESC '$@' as$(printf ' %q' "$@")
  unit "$@" <<<"$stdin"
  code=$?
  echo CODE $code
  exit $code
}

function unit () {
  # runs specified test $unit as described by TEST() environment setup
  # usage: [TEST_FILE] unit=UNIT ..[ARGS]
  # may use optional, already parsed by TEST(), [key=value] parameters
  # this function should be implemented at test scripts
  EUSAGE=EUSAGE
  type $EUSAGE &>/dev/null || EUSAGE="echo $BASH_SOURCE: EUSAGE:"
  $EUSAGE "$FUNCNAME() should be implemented at test scripts" >&2
  return 2
}

##
## HELP
##

function HELP () {
  # control function to output command usage help and information
  # usage: HELP (usage|usage [SEARCH]|lineno)? 
  # useful also to grep documentation from the source, like this comment
  shift
  case "$*" in
    '') # outputs help for MAIN() function
      read -d ':' N <<<"$( grep -E -n -m1 '^}' "$BASH_SOURCE" )"
      head -n $N "$BASH_SOURCE" | grep -E --color '# .+|^' #\
        #| grep -E --color "^[a-z]+|#| # usual .+|  [a-z]+\) #"
      ;;
    usage) # grep function usage help from $0 file
      if ! test -t 1; then
        grep -E --color=always -A 1 \
          "^function|^##.*|# us(age|ual):| [a-Z0]+\) #" "$0"
        return $?
      fi
      (
        HELP help | grep -E --color=always '# .+|^' 
        echo "##"
        echo "## $0 USAGE HELP"
        echo "##"
        HELP help usage
      ) | less -R
      #egrep --color "# |usage|[a-z]+\)" ;;
      ;;
    usage*) # grep usage help
      shift
      HELP usage | grep --color -E -C 3 "${1^^}|${1,,}" \
        && echo search for "$@" succed \
        || echo "$@" "not found"
      ;;
    lineno) grep -n -E --color '^function|^}( >&2)?$' "$0" ;;
  esac
}

# run the test when issued to do so
test "$BASH_SOURCE" = "$0" && MAIN "$@" || return 0

##
# vim modeline (see vim +'help modeline')
# /* vim: set expandtab: */
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
