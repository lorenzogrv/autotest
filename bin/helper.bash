#!/bin/bash
# keep an eye on this (WIP) guide: http://guide.bash.academy/

##
# OUTPUT, LOG, ETC -------------------------------------------------- OUTPUT -V

##
# Same as `echo`, but write to stderr. To learn about stdio redirections:
# - http://www.catonmat.net/blog/bash-one-liners-explained-part-three/
echoerr () { >&2 echo "$@"; }
_log () { echoerr "[$$] bashelpr: $@"; }
_logn () { echoerr -n "[$$] bashelpr: $@"; }

# TODO test it is working as expected
# TODO support multiple flags on same call. Actually only 1 flag (per call) is supported
_out () {
  local stamp="[$$] (${1:-'¿?'}): " flags="" args="${@:2}"
  if [[ $2 == '-n' ]]; then flags="-n "; args="${@:3}"; fi
  # re-format multiline messages to maintain visual consistency
  # Built-in replace rocks, forget sed, see http://wiki.bash-hackers.org/syntax/pe#search_and_replace
  # Reformating multiline outputs is NOT NECCESARY if -e is not set
  if [[ $2 == '-e' ]]; then flags="-e "; args="${@:3}"; args=${args//\n/\n${stamp}+i: }; fi
  # TODO pretty formating with asscii for multiline (instead '+i: ')
  echoerr ${flags}${stamp}"${args}"
  # do not quote, or flags become part of the message
}
info () { _out II $@; }
warn () { _out WW $@; }
emsg () { _out EE $@; }
fail () { _out EE $@; call_trace; exit 1; } # TODO optional exit status code

##
# ASERTIONS ------------------------------------------------------- ASERTIONS -V

printf_col () {
local w=${1:-20} # column width
printf "%11s%-11s" `echo $STR | cut -c 1-$((${#STR}/2))` `echo $STR | cut -c $((${#STR}/2+1))-${#STR}`
}

##
# Print a call stack trace to stdout, meant to be read by an human
# - arg $1: callsite to begin the trace. Defaults to 1
# - example: `echo -e "OMG! WTF? call stack:\n$(call_site)\n Fatal error! see above."`
# - Awesome: 'Read columns from input through herestring redirection'
#   - Learn "here strings": http://wiki.bash-hackers.org/syntax/redirection#here_strings
#   - Learn "caller" and "read": `help read; help caller`
# - Learn amazing tables with printf format: `man printf; man 3 printf`
# - TEST: (source helper.bash; first(){ sec; }; sec(){ third; }; third(){ quad; }; quad(){ call_trace; }; first)
# TODO better output format ?
call_trace () {
  local n=${1:-0} below=$(printf 'v%.0s' {1..20}) above=$(printf '^%.0s' {1..20})
  # not elegant, but working "repeat char n times" - from http://stackoverflow.com/a/5349842/1894803
  printf "$below TRACE BELOW $below\n"
  printf "call%20s %-3s /path/to/file\n" "routine name" "line"
  while callsite=$(caller $n); do
#	  {  echo "${#callsite[@]} elements on '${callsite}'"; }
    read line fn file <<< "$callsite"
    printf " %-2s %20s %-3s %s\n" "$n" "$fn" "$line" "${file/main/main (${BASH_SOURCE[0]}})"
    (( n++ ))
  done
  printf "$above TRACE ABOVE $above\n"
}

##
# General use assert-failed action: Use "fail" to report error and exit
#TODO descriptive exit codes?
assert_e () { echoerr -e "assertion error: $@\nTrace:" "$(call_trace 1)"; exit 1; }

#TODO assert_var_set: http://stackoverflow.com/questions/3601515/how-to-check-if-a-variable-is-set-in-bash
assert_str () { [[ -n "$1" ]] || assert_e "'$1' must be an string"; }
##
# Asserts $1 is an even integer. From http://stackoverflow.com/q/15659848/1894803
# NOTE: Observe aritmetic expression has exit status 1 if result = 0. Learn: `help "(("`
assert_int_par () { { ! (( ${1} % 2 )); } || assert_e "'$1' must be an even integer"; }
assert_int_odd () { (( ${1} % 2 )) || assert_e "'$1' must be an odd integer"; }

assert_e_ENOENT () { assert_e  "'$@' does not exist"; }
assert_dir_exists () { [[ -d "$1" ]] || assert_e_ENOENT "$1"; }
assert_file_exists () { [[ -f "$1" ]] || assert_e_ENOENT "$1"; }

##
# Ensure global variable scope is writable ($BASH_SUBHELL=0)
# - arg $1: optional error message to replace the default message
assert_global_scope () {
  if [[ $BASH_SUBSHELL != 0 ]]; then
    local msg=${1:-'Write access to the global variable scope is required'}
    read line fn file <<< $(caller 1) # omit the assert call from trace
    assert_e "$msg:\nAt (file:line) $file:$line\n'$fn' runs in a lvl $BASH_SUBSHELL bash subshell." 
    # fail performs an exit, so while loop below never runs
    # TODO would be awesome to stop the main process at subshell 0, but... IS POSSIBLE? HOW?
    while [[ $BASH_SUBSHELL != 0 ]]; do exit 1; done
  fi
}

which_test () {
    if [ -z "$(which $1)" ]; then
        _log "Could not find the program '$1'."
	# TODO optional help message ¿replacing this one?
	# i.e. [[ -n "$2" ]] && _log "$@"
	_log "Try 'apt install $1' or 'apt search $1'"
    exit 1; fi
}

##
# Research the absolute path to the script's file directory
# - usage: `research_source "${BASH_SOURCE[0]}"` (From the script file)
# - see: http://stackoverflow.com/a/246128/1894803
research_source () {
    local DIR="" SOURCE=$1; while [ -h "$SOURCE" ]; do
      DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
      SOURCE="$(readlink "$SOURCE")"
      [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
    done; echo "$( cd -P "$( dirname "$SOURCE" )" && pwd )";
}

##
# --------------------------------------------------------------------
## UI helpers
##
# Asks user to pick an option within a list.
option_list () {
  local list=($1) PS3="> Pick an option number: #"
  [ ${#list[@]} -eq 0 ] && fail "At least 1 option is required (empty list)"
  select choice in ${list[@]}; do [[ -n "$choice" ]] && break; done; echo "$choice";
}

##
# Kills a job being verbose - throught stderr - about actions taken.
# - arg $1 is process pid
# - arg $2 is an optional text label to ease identification through outputed text.
# - NOTE: could replace `2>/dev/null` with `2>&-` but: http://unix.stackexchange.com/a/163959/49721
# - TODO use `>&2 echo` instead `echoerr`?
kill_job () {
  local pid=$1 text=${2:-'(-_-)U no label to ease debugging?'}
  _logn "$text (pid=$pid) - kill \$?=";
  kill $pid 2>/dev/null && { echoerr -n "0 - wait \$?="; wait $pid 2>/dev/null ; }
  local code=$?; echoerr $code; return $code;
  # If kill fails, '$?' is kill exit status. Else, it's wait exit status.
  # Save the code. At echoerr $? is "var set" code, and after $? becomes echoerr's exit status.
  # Wait resumes op when process exits OR IT FAILS!. Wait will report the killed process status.
  # Cant know here, when wait $?>0, if it's a wait failure or killed process status
  # TODO (EDIT) maybe can be done poking away with exit codes, CHECK `man wait` TOO
  # see http://unix.stackexchange.com/questions/48533/exit-shell-script-from-a-subshell
}

##
# Propagate signal $1 to every running job
# TODO base this implementation on job id rather than pid?
# - learn: kill child ps on exit + trap examples: http://stackoverflow.com/documentation/bash/363/using-trap-to-react-to-signals-and-system-events#t=2016103119362304471
kill_orphans () {
  local sig="${1:-SIGTERM}"
  jobs -pr > >( while read -r pid; do
    _logn "kill -$sig $pid: "; kill -s $sig $pid
    # use wait to avoid kill output: http://stackoverflow.com/a/10200191/1894803
    # put wait on background so kills are "parallel"
    wait $pid 2>/dev/null; echoerr "code=$?"
  done ) #& WTF? while use a background process here?
  # AGAIN?! REDUNDANT!! jobs && _log "Waiting all jobs to end (${2:-'Unknown origin'})" && wait
  return 0
}

##
# Enable job control mode ¿?
# - http://mywiki.wooledge.org/ProcessManagement#I_want_to_do_something_with_a_process_I_started_earlier
# set -m

# see also: http://unix.stackexchange.com/a/57960/49721 + http://unix.stackexchange.com/a/149093/49721
#trap 'kill -SIGINT $(jobs -pr)' SIGINT
# TODO option to disable/modify trap's default setup (env var maybe?)
# Trap EXIT and ERR independently
exit_cb=()
on_exit () { exit_cb+=("$@"); } 
trap 'for (( i=${#exit_cb[@]}-1; i>=0 ; i-- )) ; do ${exit_cb[i]}; done; _log "LAST KILL TRY!"; kill_orphans' EXIT
trap 'echo && echo User Interrupt && exit 1' SIGINT
#trap 'kill_orphans SIGTERM "cleanup for err event"' ERR; _log "orphan murder trap set for ERR"
