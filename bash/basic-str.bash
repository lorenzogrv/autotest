##
# not elegant, but working "repeat char n times"
# basics taken from http://stackoverflow.com/a/5349842/1894803
str_repeat () {
  local char=$1 count=$2
  test $count -eq 0 && return
  printf "%.0s${char}" $(seq 1 $count)
  printf "\n"
}

##
# determine whenever string 1 ($1) contains string 2 ($2)
# TODO
# - if string2 has backslashes, should use "$(printf '%q' "$2")"
#   see comments of http://stackoverflow.com/a/8811800/1894803
# - posible renames: does_str1_contain_2 does_arg1_contain_2
string_1_contains_2 () { test "${1#*$2}" != "$1"; }

##
# determine whenever flag (described by string $1) is enabled.
# $2 can be optionally set to a string like the "$-" internal variable.
# Reference
# - `help set`
# - [special dollar sign variables](http://stackoverflow.com/a/5163260/1894803)
is_flag_enabled () { string_1_contains_2 "${2:-$-}" $1; }


