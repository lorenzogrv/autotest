
function autotest () {
  # dumb function which bypasses api tests
  case "$1" in
    load)
      source "$(autotest--root)/api/${2:?missing name}.bash"
      ;;
    *) return 1
  esac
}

function PASS () {
  echo PASS "$@" 
}

function FAIL () {
  # usage: FAIL [--next]? [code]? [arguments]{0,n}
  # echoes specified [arguments] to standard output and exits with code 1
  # --next option disables the exit behaviour
  # TODO if [code] is known (see `autocode`), exits with that code instead
  test "$1" = "--next" && {
    shift; echo FAIL "$@"; return
  }
  echo FAIL "$@"
  echo CODE 1 by $FUNCNAME \@${FUNCNAME[1]}
  exit 1
}

##
# vim modeline (see vim +'help modeline')
# /* vim: set expandtab: */
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
