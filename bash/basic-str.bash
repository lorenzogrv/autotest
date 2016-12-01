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
# not unit tested, but minimal working "remove ansi control sequences"
# TODO optional read from stdin?? => senseless, requires an extra process
# TODO consider using `strings` (similar to `tr -dc '[[:print:]]' <<<$var`)
# TODO consider a pure bash solution, i.e. with `${@//search/replace}`
# TODO see http://linuxcommand.org/lc3_adv_tput.php
# TODO consider ansi.bash
# quick and dirty fix for `tput sgr0`
# Reference
# - https://www.gnu.org/software/termutils/manual/termutils-2.0/html_chapter/tput_1.html
# - http://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-Controls-beginning-with-ESC
# - `hexdump -C` was helpful to dive into this http://stackoverflow.com/a/29052115/1894803
str_ansifilter () {
	# stronger with ([0-9]{1,2}(;[0-9]{1,2})?)?
	# first regex removes color, second tput sgr0
  sed 's/\x1b\[[0-9;]*[m]//g;s/\x1b(B//g' <<<"$@" || {
	  echo >&2 "$FUNCNAME: sed exited with code $?"
		exit 1
  }
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

##
# vim modeline
# /* vim: set filetype=sh shiftwidth=2 ts=2: */

