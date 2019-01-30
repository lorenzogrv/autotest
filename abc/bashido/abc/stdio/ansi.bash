# no shebang because this file is meant to be sourced by bash

ansi () {
  (( BASHIDO_ANSI_DISABLE )) && return
  local id="${1:?provide a sequence id}"
  local varname="BASHIDO_ANSI_${id//\./_}"
  varname="${varname^^}" # capitalizes each letter
  if test -z "${!varname+x}"
  then # variable with name $varname is unset
		# see https://stackoverflow.com/questions/3601515/how-to-check-if-a-variable-is-set-in-bash
    >&2 echo "$FUNCNAME: no sequence named $varname"
		return 1
	fi
  # YAGNI: may be useful for providing fallbacks, but
  # TODO entire log should be refactored and use tput directly
  #test -z "${!varname}" && return 1
  printf '%b' ${!varname}
}

# forces disabling ansi format sequences
BASHIDO_ANSI_DISABLE=0

# this was and old quirk to force xterm-256color
# TODO should be removed, though
if test "$TERM" == "dumb"
then
  BASHIDO_ANSI_DISABLE=1; warn "dumb terminal detected"; return 0
fi

if type -t tput > /dev/null
then
	BASHIDO_ANSI_BG_RED="$(tput setab 1)"
	BASHIDO_ANSI_FG_RED="$(tput setaf 1)"
	BASHIDO_ANSI_BG_BLUE="$(tput setab 4)"
	BASHIDO_ANSI_FG_BLUE="$(tput setaf 4)"
	BASHIDO_ANSI_BG_CYAN="$(tput setab 6)"
	BASHIDO_ANSI_FG_CYAN="$(tput setaf 6)"
	BASHIDO_ANSI_BG_BLACK="$(tput setab 0)"
	BASHIDO_ANSI_FG_BLACK="$(tput setaf 0)"
	BASHIDO_ANSI_BG_WHITE="$(tput setab 7)"
	BASHIDO_ANSI_FG_WHITE="$(tput setaf 7)"
	BASHIDO_ANSI_BG_GREEN="$(tput setab 2)"
	BASHIDO_ANSI_FG_GREEN="$(tput setaf 2)"
	BASHIDO_ANSI_BG_ORANGE="$(tput setab 3)"
	BASHIDO_ANSI_FG_ORANGE="$(tput setaf 3)"
	BASHIDO_ANSI_BG_PURPLE="$(tput setab 5)"
	BASHIDO_ANSI_FG_PURPLE="$(tput setaf 5)"

	BASHIDO_ANSI_REV="$(tput rev)"
	BASHIDO_ANSI_DIM="$(tput dim)"
	BASHIDO_ANSI_BOLD="$(tput bold)"
  BASHIDO_ANSI_RESET="$(tput sgr0)"

	BASHIDO_ANSI_LOG_BEGIN="$(tput dim)"
	BASHIDO_ANSI_LOG_TRAIL="$(ansi reset)"
	BASHIDO_ANSI_LOG_VALUE="$(ansi rev)"
	BASHIDO_ANSI_LOG_VV="$(ansi fg.purple)"
	BASHIDO_ANSI_LOG_UX="$(ansi fg.green)"
	BASHIDO_ANSI_LOG_II="$(ansi fg.blue)"
	BASHIDO_ANSI_LOG_WW="$(ansi fg.orange)"
	BASHIDO_ANSI_LOG_EE="$(ansi fg.red)"
else
	# disable ansi before using log or will raise error
	BASHIDO_ANSI_DISABLE=1
  warn "tput not present so ansi-formated log is disabled"
	utip "> try '%s' (debian-based systems)" "apt install ncurses-utils"
	utip "   or '%s' (other systems)" "iai pkg search-basename tput"
fi

##
# vim modeline
# /* vim: set expandtab: */
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
