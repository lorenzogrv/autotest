#!/bin/bash

if test "$(type -t bashido)" == "function"
then
	# as bashido was defined, asume log was loaded
	warn "process %s is sourcing bashido.require again" "$$"
	# TODO execution should really raise a fatal error here instead warning
	call_trace | warn
	# this is another workaround to avoid overriding BASHIDO_REQUIRE
	return # can't use exit as this file is meant to be sourced
fi

function bashido () {
	if ! (( $# ))
	then # 1st form: no arguments, same as bashido.root (for backwards compat)
		bashido.root
	elif test "$1" == "api"
	then # 2nd form: output the absolute path to source api (entry point)
	  echo "$(bashido.root)/abc/bashido.bash"
	elif test "$(type -t "bashido.$1")" == "function"
	then # 3rd form: call command with given argv
		local command="bashido.$1"; shift;
		info "exec by process $$ %s" "$command $@"
		$command "$@"
	else # 4th form: backwards compat avoiding delegation on non-existant functions
		bashido.translate "${1//-//}" # translate dashes to slashes (backwards compat)
	fi
}

function bashido.root () {
	# researches bashido's root directory and prints it out
	##
	SOURCE="${BASH_SOURCE[0]}"
	while [ -h "$SOURCE" ]; do
		DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
		SOURCE="$(readlink "$SOURCE")"
		[[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
	done
	dirname "$(cd -P "$( dirname "$SOURCE" )" && pwd)"
}

##
# Special hook while running or being sourced
# The following cases avoid "doing more", as it's not necessary
# - 1st form: no arguments, same as bashido.root (for backwards compat)
# - 2nd form: when requesting the api entry point
if test "$1" == "api" || ! (( $# )); then	bashido "$@"; exit; fi

function bashido.help () {
	# prints help about bashido usage
	##
	cat <<HELP
=======
bashido: General purpose bash scripting API
=======
Command-line usage:
  1st form: 'bashido' outputs the bashido root directory (see NOTE 1)
  2nd form: 'bashido api' outputs abstolute api entry point (see NOTE 2)
  3rd form: 'bashido {command} [argv]*', where {command} is one of:
            $(\
	while read d t fn; do echo $fn; done < <(declare -F)\
	| grep "bashido."\
	| sort\
	|	while read cmd; do printf "  ${cmd##bashido.}"; done
)
            > Use 'bashido help {command}' for command specific help.
            > **DISCLAIMER: 'bashido help {command}' not implemented yet**
  4th form: 'bashido {reference}' same as 'bashido translate {reference}'

NOTE 1: First and fourth forms are meant for backwards compatibility

NOTE 2: The --source-only argument prevents bashido from running commands,
        to include bashido within a script, use the following code:
            source "\$(bashido api)" --source-only
- - - -
> 'bashido' stands for "the path of bash' spirit", likewise 'bushido'"
- - - -
HELP
# TODO implement bashido help {command}
  (( $# )) && fail "%s not implemented" "bashido help {command}"
}

function bashido.libroot () {
	# researches bashido's root directory and prints out its library root
	##
	echo "$(bashido.root)/abc"
}

function bashido.translate () {
	(( $# )) || fail "missing argument 1 (reference to translate)"
	# translates a bashido reference into an absolute file path
	local ref="${1//.//}" # translate dots to slashes (backwards compat)
	local file="$(bashido.libroot)/${ref//\.//}.bash"
	test -r "$file" && echo "$file" || {
		fail "BASHIDO ERROR: '$file' is not readable"
		return 1 # not neccesary but wanted to be explicit
	}
}

function bashido.require () {
	# with a nested function, its guaranteed that:
 	# - BASHIDO_REQUIRED is declared only once
	# - BASHIDO_REQUIRED is not set to empty if this file is sourced again
	declare -g BASHIDO_REQUIRED

	function bashido.require () {
	  (( $# )) || fail "missing argument 1 (reference to require)"
		local ref="$1"
		if grep -e "$ref" <<<"$BASHIDO_REQUIRED" >/dev/null
		then
			# in theory, log is the first thing loaded so warn will never fail
			warn "process $$ already required $ref" || exit
			# TODO should an error be raised instead?
			call_trace | warn
			return 0
		fi
		source "$(bashido.translate $ref)" || exit
		BASHIDO_REQUIRED+="$1,"
		verb "process $$ sourced %s" "$1" || { echo "WTF $$ sourced $1"; exit 127; }
	}

	bashido.require "$@" # call the require logic also the first time
}

# once require is defined, load the minimal api required by bashido itself
# log is the first thing as it's used by bashido builtins (inc. require)
bashido.require "log" || exit

# TODO error should be Errors, though
bashido.require "error" || exit

# not required here, but used everywere
bashido.require "is" || exit
bashido.require "api.assert" || exit

# TODO this shit belongs to "is" api
function bashido.isref () {
  (( $# )) || fail "missing argument 1 (reference string to be tested)"
	local ref="$1" fn="${1##*.}"
	test "${ref//\.//}" != "$ref" || {
		emsg "BASHIDO ERROR: reference string '$ref' has no dots"
		return 1
	}
	(bashido.translate "$ref") >/dev/null || {
		emsg "BASHIDO ERROR: '$ref' can't be translated to a readable file"
	  return 1
	}
	# it could be a builtin, so fn may be already defined
	# TODO sure the state above is true??
	is_function "$fn" && return 0
	(
		bashido.require "$ref"
		test "$(type -t "$fn")" == "function"
	) || {
	  emsg "BASHIDO ERROR: '$ref' don't defines '$fn' (bashido.require)"
	  return 1
	}
	(
		source "$(bashido $ref)" || exit
		test "$(type -t "$fn")" == "function"
	) || {
	  emsg "BASHIDO ERROR: '$ref' don't defines '$fn' (backwards compat)"
	  return 1
	}
	return 0
}

##
# MAIN ROUTINE:
##

case "$1" in
	# api is useless here, but included to be explicit
	# TODO re-analyze the way to include bashido
	'api') fail "source process $$ should have stoped" ;;
	'--source-only') info "process $$ sourced bashido" ;;
	# all other cases: run bashido with given argv
	# provides backwards compat plus internal builtins
	*) bashido "$@"	;;
esac

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
