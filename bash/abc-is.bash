##
# Tells whenever "variable name" ($1) references an array
# see http://stackoverflow.com/a/27254437/1894803
is_array () {
  local varname="${1?"$FUNCNAME: missing \$1"}"
  local desc="$(declare -p "$varname" 2>/dev/null)"
  if [[ "$desc" =~ 'declare -a' ]]; then return 0; fi;
  return 1
}

##
# Tells whenever given value ($1) is an integer
# basics taken from http://stackoverflow.com/a/3951175/1894803
is_int () {
  case "${1#[-]}" in
    ''|*[!0-9]*) return 1 ;;
    *) return 0 ;; #TODO may I omit this?
  esac
}

##
# `type` based *is whatever* tests
# - `is_something`: Tells whenever $1 refers to something TODO better description
# - `is_function`: Tells whenever $1 is the name of a function
# Reference
# - `help type`
is_something () { type -t "${1?"$FUNCNAME: missing \$1"}" >/dev/null; }
is_function () { is_something $1 && test "$(type -t $1)" == "function"; }
# TODO running type twice seems stupid...

