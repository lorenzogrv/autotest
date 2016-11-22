
# Same as `echo`, but write to stderr
eche () { >&2 echo "$@"; }

##
# Same as `eche`, preceding output with `[$$]#$BASH_SUBSHELL ($1): `
# TODO
# - test it is working as expected
# - support multiple flags on same call. Actually only 1 flag (per call) is supported
_log () {
  #TODO assert arguments length >= 2, assert $1 is one of V[1-9], II, WW, EE
  local stamp="[$$]#$BASH_SUBSHELL (${1?'log level is required'}): " flags="" args="${@:2}"
  if [[ $2 == '-n' ]]; then flags="-n "; args="${@:3}"; fi
  # re-format multiline messages to maintain visual consistency
  # Reformating multiline outputs is NOT NECCESARY if -e is not set
  if [[ $2 == '-e' ]]; then flags="-e "; args="${@:3}"; args=${args//\n/\n${stamp}+i: }; fi
  # TODO pretty formating with asscii for multiline (instead '+i: ')
  eche ${flags}${stamp}"${args}"
  # do not quote, or flags become part of the message
}
