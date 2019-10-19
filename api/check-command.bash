
test "$(type -t verb)" = "function" || verb () { false; }

# quick-and-dirty but working
function check-command () {
  local c # will be the pointer for argument parsing strategy
  local AUTOCMD # will store the command to be executed

  test -z "$*" && {
    echo "$FUNCNAME: bad usage (missing arguments)"
    exit 2
  } >&2
 
  # the command argv ends just before first semicolon
  while (($#)); do
    case "$1" in \;) break ;; esac
    AUTOCMD+=("$1"); shift
  done

  if test "$1" != ';'; then
    echo "$FUNCNAME: bad usage (no trailing semicolon for command)" >&2
    exit 2
  else
    shift
  fi

  verb "AUTOCMD='${AUTOCMD[@]}'"

  while (($#))
  do
    AUTOPLUG=("$FUNCNAME$1") # will hold the plugin command
    shift
    
    test "$(type -t "$AUTOPLUG")" = 'function' || {
      echo "$FUNCNAME: plugin not found: '$AUTOPLUG'"
      exit 127
    } >&2

    # the plugin argv ends just before the next "long option" argument
    verb "arguments are '$@'"
    while (($#)); do
      case "$1" in --?*) break ;; esac
      AUTOPLUG+=("$1"); shift
    done
    verb "AUTOPLUG='${AUTOPLUG[@]}'"

    # plugin functions will run with the following argument list:
    # its parameters, followed by '-command', followed by the command
    # if plugin fails will return its exit code, omiting subsequent actions
    "${AUTOPLUG[@]}" || return $? #-command "${AUTOCMD[@]}" || return $?
  done

  test -n "$AUTOPLUG" || {
    echo "$FUNCNAME: invalid usage (no assertions specified)"
    exit 2
  } >&2
}

diag () {
  local l probe=0
  while IFS= read l; do
    diag-msg $1 "${l#${BASH_SOURCE%/*}/}" "$2" "$3";
    probe=1
  done
  test "$l" != '' \
    && diag-msg $1 "$l" "<(no line break present)" "$3" \
    || (( $probe )) # returns true when data was output
  #echo "diag $@ end l='$l' probe=$probe" >&2
}

diag-msg () {
  local line="${2:-<(empty line)}"
  printf '%2s | %s%s %s %s\n' \
    "$((++n))" "${1:-?}" "${4:->}" \
    "${line//$'\n'/(newline char)}" \
    "${3:-<}"
} >&2

##
# vim modeline
# Vim: set filetype=sh ts=2 shiftwidth=2 expandtab:
