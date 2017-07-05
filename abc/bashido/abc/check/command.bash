
source "$(bashido check.common)"

check.command () {
	local cmdline="$1" cmd="$2" val="$3"
	case "$cmd" in
		--code-is)
			( eval "$cmdline" ) 1>/dev/null
			( assert.last-code-is $val )
			tested "running '$cmdline' returns '$val'"
			;;
		--outputs)
			case "$val" in
				"")
					diff_test <( eval "$cmdline" ) <&0
					tested "running '$cmdline' outputs given stdin"
					;;
				nothing)
					test "$( eval "$cmdline" )" == ""
					tested "running '$cmdline' outputs nothing"
					;;
				*)
					diff_test <( eval "$cmdline" ) <<<"$val"
					tested "running '$cmdline' outputs given string"
					;;
			esac
			;;
		*)
			echo "test_cmd: unknown action '$cmd'"
	esac
}
##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
