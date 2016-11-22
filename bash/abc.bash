

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
info () { _log II $@; }
warn () { _log WW $@; }
emsg () { _log EE $@; }
cant () { _log EE "Can't $@"; exit 1; }

##
# TODO optional exit status code?
# trace allways start at the callsite preceding the fail call
fail () { emsg $@; call_trace 2 >&2; exit 1; }

##
# abc sources by default abc-*.bash
# TODO ugly hardcoded source calls. Fix and use glob pattern
# ls -l bash/*.bash
source "bash/abc-basics.bash" || exit
source "bash/abc-call_trace.bash" || { emsg "could not source call_trace"; exit 1; }
source "bash/abc-is.bash" || { emsg "could not source is"; exit 1; }
