
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
    *)
      test -f "$1" && EUSAGE "missing implementation"
        #{ autoexec "$@"; exit $?; }
      
      # when $1 is not a file neither a subcommand, fail with ENOENT
      ENOENT "'$1' is not a subcommand, neither a file"
  esac
}

##
# vim modeline (see vim +'help modeline')
# /* vim: set expandtab: */
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
