# quick-and-dirty but working
function check-command () {
  local c=0 # will be the pointer for argument parsing strategy
  
  # the command argv ends just before first "long option" argument
  # CARE: line below will hurt your eyes multiple times
  while ((c++ < $#)); do case "${@:$c+1:1}" in --*) break; esac; done
  local CMD_END=$c # command is now "${@:1:$CMD_END}"

  while ((c++ < $#))
  do
    local ACTION="${@:$c:1}" FIRST=$c
    # the action argv ends just before the next "long option" argument
    # CARE: hurting-your-eyes Round 2
    while ((c < $#)); do case "${@:$c+1:1}" in --*) break; esac; let c++; done
    # now $ACTION arguments are "${@:$FIRST+1:$c-$FIRST}"

    if test "$(type -t "${FUNCNAME}${ACTION}")" != "function"
    then # action is not a plug-in function
      # built-in actions could be implemented here, but KISS
      >&2 echo "$FUNCNAME: there is no '$ACTION' plug-in function"; return 2
    fi

    # plugin functions will run with the following argument list:
    # its parameters (if provided), followed by '--', followed by the command
    # if action fails will return its exit code, omiting subsequent actions
    "${FUNCNAME}${ACTION}" "${@:$FIRST+1:$c-$FIRST}" -- "${@:1:$CMD_END}" \
      || return $?
  done
}
##
# vim modeline
# Vim: set filetype=sh ts=2 shiftwidth=2 expandtab:
