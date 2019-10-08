# quick-and-dirty but working
function check-command () {
  local c # will be the pointer for argument parsing strategy
  local AUTOCMD # will store the command to be executed

  verb "arguments are '$@'"
  { ! (( $# )) || test -z "$*"; } && {
    echo "$FUNCNAME: missing arguments"
    return 2
  } >&2
  
  # the command argv ends just before first "long option" argument
  while (($#)); do
    case "$1" in --?*) break ;; esac
    AUTOCMD+=("$1"); shift
  done
  verb "AUTOCMD='${AUTOCMD[@]}'"

  while (($#))
  do
    AUTOPLUG=("$FUNCNAME$1") # will hold the plugin command
    shift
    
    test "$(type -t "$AUTOPLUG")" = 'function' || {
      echo "$FUNCNAME: unexistant plugin specified: '$AUTOPLUG'"
      return 127
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
    "${AUTOPLUG[@]}" -command "${AUTOCMD[@]}" || return $?
  done

  test -n "$AUTOPLUG" || {
    echo "$FUNCNAME: no assertions specified"
    return 2
  } >&2
}
##
# vim modeline
# Vim: set filetype=sh ts=2 shiftwidth=2 expandtab:
