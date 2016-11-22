##
# Tools to research about the parent process of process specified by pid.
# When no pid is specified, `$1` defaults tocurrent process pid (`$$`)
# - parent_pid: output the ppid of `$$`
# - parent_cmd: output the command which is the parent of `$$`
# - parent_bin: output the executable name of `parent_cmd`
# TODO
# - [ ] clean up that shitty checks
parent_pid () {
  local id=${1:-$$}
  test $id -eq 1 && echo "pid out of range" >&2 && return 1
  ps ho ppid --pid $id
}
parent_cmd () {
  echo "cmd $@" >&2
  if ppid=$(parent_pid $1); then
    ps ho cmd --pid $ppid
  else
    echo "detected"
    return 1
  fi
}
parent_bin () { local cmd=($(parent_cmd $1)); echo ${cmd[0]}; }
