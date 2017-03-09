
##
# "log" api: helper functions that write to stderr
# same as `echo` but output to stderr
eche () { >&2 echo "$@"; }
# logs a message ($") to stderr with desired level mark ($2 or ??)
log () { eche "[$$]#$BASH_SUBSHELL (${2:-??}):" "$1"; }
# follows each input line to 'log' with desired level mark ($1)
loog () { while read line; do log "$line" "$1"; done < <(cat); }
# logs messages with an error level mark (EE)
emsg () { if (($#)); then log "$@" EE; else <&0 loog EE; fi; }
# logs messages with an info level mark (II)
info () { if (($#)); then log "$@" II; else <&0 loog II; fi; }
# logs messages with a verbose level mark (VV)
verb () { if (($#)); then log "$@" VV; else <&0 loog VV; fi; }
# helper to [fail fast](http://www.martinfowler.com/ieeeSoftware/failFast.pdf)
# Aditionally adds a call trace.
fail () { emsg "$@"; call_trace 1; exit ${ERR:1}; }

####
# fail: same as `emsg`, but also writes a call trace and exits with code=1
# `fail` allows [fail early] "exit code catchs" like:
#     `( false ) || { echo "error description"; exit 1; }`
#     `(exit -1) || { code=$?; echo "catched code $code"; exit $code; }`
# as:
#     `( false ) || fail "error description"`
#     `(exit -1) || fail "catched code $?"`
#
# Helper function to [fail early](http://stackoverflow.com/a/2807375/1894803)
####

