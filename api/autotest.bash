
function autotest () {
  # dumb function which bypasses api tests
  case "$1" in
    load)
      test -n "$2" || EUSAGE "missing name" || exit
      file="$(autotest--root)/0rigin/$2"
      test -r "$file" \
        || file="$(autotest--root)/api/$2.bash"
      test -e "$file" || ENOENT "'$file' does not exist" || exit
      set --
      source "$file" \
        || Error $? --trace "source $(printf %q "$2") raised $?"
      verb "loaded $file"
      return 0
      ;;
    0|[A-Z])
      file="$(autotest--root)/0rigin/$1"
      shift
      verb "will execute $file with argv='$@'"
      ( exec -c -a "${file#$PWD/}" "$file" "$@" ) || exit $?
      ;;
    *) EUSAGE "missing implementation"
  esac
}

function Error () {
  local trace code
  test "$1" = "--trace" && { trace=1; shift; } || trace=0
  code="${1:-3}"; shift # Default to 3: invalid exit status code
  echo "|@${FUNCNAME[2]}: ${FUNCNAME[1]} Error:" "$@"
  if (test $trace -eq 1 || verb "trace" )
  then
    n=0
    while (( ++n < ${#BASH_SOURCE[@]}-1 )); do
      read line funcname file <<<"$(caller "$n")"
      test ${#funcname} -gt 6 && funcname=${funcname:0:4}..
      #echo "@$funcname in $file +$line"
      printf '|%7s: ' @$funcname
      tail +$line "$file" | head -n 1 | xargs
      printf '|%7s %4s %s\n' '>' +$line $file
    done
  fi
  exit $code
} >&2

function EUSAGE () { Error 2 "$@"; }
function ENOENT () { Error 127 "$@"; }

##
# vim modeline (see vim +'help modeline')
# /* vim: set expandtab: */
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
