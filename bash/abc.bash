

##
# helper functions that write to stderr
# - info: logs an informational message
# - warn: logs a warning message
# - emsg: logs an error message
# - cant: same as `emsg`, but also exits with code=1
# - fail: same as `emsg`, but also writes a call trace and exits with code=1
# TODO
# - verb: logs a verbose message
# - dlog: echoes the name action to use for verbose messages?
# - noop: empty function that does nothing
# - verbosity levels (V0 to V9), VV = all
# - deprecate cant¿?
info () { _log II $@; }
warn () { _log WW $@; }
emsg () { _log EE $@; }
cant () { _log EE "Can't $@"; exit 1; }

####
# # Helper function to [fail early](http://stackoverflow.com/a/2807375/1894803)
# `fail` allows [fail early] "exit code catchs" like:
#     `( false ) || { echo "error description"; exit 1; }`
#     `(exit -1) || { code=$?; echo "catched code $code"; exit $code; }`
# as:
#     `( false ) || fail "error description"`
#     `(exit -1) || fail "catched code $?"`
#
# Aditionally adds a call trace.
# TODO optional exit status code?
####
fail () { emsg $@; call_trace 0 >&2; exit 1; }

##
# abc sources by default abc-*.bash
# TODO ugly hardcoded source calls. Fix and use glob pattern
# ls -l bash/*.bash
source "bash/abc-basics.bash" || exit
source "bash/abc-call_trace.bash" || { emsg "could not source call_trace"; exit 1; }
source "bash/abc-is.bash" || { emsg "could not source is"; exit 1; }
