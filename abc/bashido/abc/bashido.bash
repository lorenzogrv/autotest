# no shebang because this file is meant to run with 'source' command

function bashido () {
	# no arguments, delegate on bashido-root (for backwards compat)
  (( $# )) || { bashido.root; return; }

  if test "$(type -t "bashido.$1")" == "function"
	then
		local command="bashido.$1"; shift;
		$command "$@"
	else
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

function bashido.help () {
	cat <<HELP
=======
bashido: General purpose bash scripting API
=======
** HERE SHOULD BE SOME HELP TEXT **
- - - -
HELP
}

function bashido.isref () {
	local ref="${1:?'missing argument (reference string)'}"
	local fn="${ref##*.}"
	test "${1//\.//}" != "$1" || {
		>&2 echo "BASHIDO ERROR: reference string '$ref' has no dots"
		return 1
	}
	bashido.translate "$ref" 1>/dev/null || {
		>&2 echo "BASHIDO ERROR: '$ref' can't be translated to a readable file"
	  return 1
	}
	(
		source "$(bashido api.require)"
		source "$(bashido $ref)"
		test "$(type -t "$fn")" == "function"
	) || {
	  >&2 echo "BASHIDO ERROR: '$ref' don't defines '$fn' (old way)"
	  return 1
	}
	(
		source "$(bashido api.require)"
		bashido.require "$ref"
		test "$(type -t "$fn")" == "function"
	) || {
	  >&2 echo "BASHIDO ERROR: '$ref' don't defines '$fn' (old way)"
	  return 1
	}
	return 0
}

function bashido.translate () {
	local ref="${1//.//}" # translate dots to slashes (backwards compat)
	local file="$(bashido.root)/abc/${ref//\.//}.bash"
	test -r "$file" && echo "$file" || {
		>&2 echo "BASHIDO ERROR: '$file' is not readable"
		return 1
	}
}

##
# MAIN ROUTINE: run bashido with given argv
##

bashido "$@"

# TODO when there are multiple arguments?
#find "$bashido" -name "abc-*.bash" -exec cat {} +

##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
