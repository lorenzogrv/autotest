##
# "log" api
# =========
# The log api is a bunch of helper functions that write to stderr.
# They are designed to allow reading from standard input if need.
# TODO document the usage

source "$(bashido abc-ansi)"

# same as `echo` but output to stderr
eche () { >&2 echo "$@"; }

# follows each input line to 'log' with desired level mark ($1)
loog () { while read line; do log "$1" "${line}"; done <&0; }

log () {
  # writes a message with lvl $2 to the($1) to stderr with desired level mark ($2 or ??)
  local lvl="${1:?'provide the log level'}"
  local msg="$2" # dont fail if empty, it could be an empty newline
  
  case $lvl in EE|WW|II|VV) ;; *) fail "invalid log lvl '$lvl'";; esac
  
  # Research where this log message was generated
  # TODO this seems too dirty
  local line fn file n
  read line fn file <<<"$(caller 0)"
  test "$fn" != "loog"; n=$(( 1 + $? ))
  read line fn file <<<"$(caller $n)"

  if log.filter "$lvl" "$fn" "$file"
  then
    local c=$(ansi log.$lvl) r=$(ansi reset)
    local b=$(ansi log.begin) t=$(ansi log.trail)
    if test $# -gt 2
    then
			shift;
			# TODO values specified should be styled with $v
			# TODO actually implemented, but not tested
      local v=$(ansi log.value)
			local args="$(printf " $v%q$r$b$c" "${@:2}")"
			args="${args#' '}"
			#echo "'$msg'" "'$args'"
			msg="$(printf "$msg" "$args")"
    fi
    # TODO configurable way to enable this
    false && >&2 printf '%b%s%b' $(ansi log.begin) "[$$]#$BASH_SUBSHELL "
    >&2 printf "$b($c%s$r$b)@%s: $c%s$t\n" "$lvl" "$fn" "$msg"
  fi
}

# decides whenever to output a log message or ignore it.
# default implementation is to output everything
log.filter () { true; }

# logs messages with an error level mark (EE)
emsg () { if (($#)); then log EE "$@"; else <&0 loog EE; fi; }
# logs messages with an warning level mark (WW)
warn () { if (($#)); then log WW "$@"; else <&0 loog WW; fi; }
# logs messages with an info level mark (II)
info () { if (($#)); then log II "$@"; else <&0 loog II; fi; }
# logs messages with a verbose level mark (VV)
verb () { if (($#)); then log VV "$@"; else <&0 loog VV; fi; }

# helper to [fail fast](http://www.martinfowler.com/ieeeSoftware/failFast.pdf)
# Aditionally adds a call trace.
fail () { emsg "$1"; emsg <<<"$(call_trace 1)"; exit 1; }

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

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
