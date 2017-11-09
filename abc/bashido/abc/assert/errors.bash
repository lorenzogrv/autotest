##
# General use error action: Use "fail" to report error and exit
#TODO descriptive exit codes? see `man exit`
# 126    A file to be executed was found, but it was not an executable utility.
# 127    A utility to be executed was not found.
Error () {
  ! is_int "$1" && fail "assertion error: $@";
  local c=$1; shift; emsg "assertion error: $@"; exit $c
}

# cause an error due to a no existing directory entry
# "entries" can be directories, regular files, symlinks, sockets, pipes, ...
# This error has no possible fix, as it's unkown what type of entry should be
# meaningof ENOENT: http://stackoverflow.com/a/19902850/1894803
Error_ENOENT () {	Error "Entry '$1' does not exist"; }
Error_ENODIR () {	Error_ENOENT "$1"; }
Error_ENOREG () {	Error_ENOENT "$1"; }
# cause an error because current user has not permission $1 for file $2
Error_EACCES () { Error "Missing '$1' permission for entry '$2'"; }

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
