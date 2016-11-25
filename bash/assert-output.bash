##
# util to test that two sources output the same
# diff quick reference:
# * `--color=never|always|auto`
# * `--text` to treat input files as text files
# * `-W` is --width (output at most [ingeger] columns)
# * `--suppress-common-lines` excludes that lines from output
# * control how to display differences
#   * `-D` NAME (enables fine-grained control over output)
#   * 
# see also `man diff`
# TODO may git-diff be better for this task? https://git-scm.com/docs/git-diff
diff_test () {
  test "$debug" == "yes" && echo "$FUNCNAME: args='$@'"
  # TODO side-by-side mode is not enough to ease viewing trailing spaces
	# -y
  diff --color=always --text --width=$(tput cols) --suppress-common-lines\
		-D DIF --
    <(cat ${1:?"missing source 1 (arguments='$@')"})\
    <(cat ${2:?"missing source 2 (arguments='$@')"})\
		|| exit 1
}

test "$1" == "--test" && {
  # abc-basics are need working as expected to run this tests
  # run their tests to be sure they are ok to procede
	source test/bash/abc-basics --test || exit
  (
    ( diff_test <(echo "baz") <(echo "baz") ); code=$?
    test "$code" == "0" || oops "code should be 0 on success"
    ( diff_test <(echo "foo") <(echo "bar") >/dev/null ); code=$?
    test "$code" == "1" || oops "code should be 1 on failure"
  )
  tested "'diff_test' returns code 1 when sources differ, 0 when match"
  (
    out="$( diff_test <(echo "foo") <(echo "bar") )" code=$?
    test "$out" != "" || oops "should output something on failure"
    out="$( diff_test <(echo "baz") <(echo "baz") )" code=$?
    test "$out" == "" || oops "should output nothing on success"
  )
  tested "'diff_test' outputs nothing on success, something on failure"
  (
	  #position 1  2  3 4  5  6  7  8  9  0
	  source1="1\n#\n#\n\n#\n2\n#\n#\n3\n#\n4"
		source2="X\n#\n#\n\n#\nX\n#\n#\nX\n#\nX"
		n=0 errors=() output=()
		while IFS= read line; do
			output+=("$((++n)) ^$line$")
			re="^\|$n[:space:]\|[:digit:]\|X[:space:]\|$"
			[[ "$line" =~ $re ]] || {
			  errors+=("  $((${#errors[@]}+1))) line $n should match regexp '$re'")
			}
		done <<<"$(diff_test <(echo -e $source1)	<(echo -e $source2))"
		test "${#errors[@]}" -eq "0" || {
		  echo "ERRORS (${#errors[@]} found):"; printf "%s\n" "${errors[@]}"
			echo "OUTPUT (${#output[@]} lines):"; printf "%s\n" "${output[@]}"
		  echo "(NOTE: '^' and '$' wrap the real output)"
			exit 1
		}; tested "output lines content"
    echo work at ${BASH_SOURCE[0]}
    exit 1 # working here
  )
  tested "'diff_test' outputs all lines that differ"
  test "$n" -eq 4; tested "outputs 4 lines to stdout"
  exit 1; tested "'diff_test' wraps outputed lines within vertical bars"
  exit 1; tested "'diff_test' outputs the lines that differ"

# the idea is writing tests as follows
diff_test <( echo -e "######\n-TEST-\n######" ) <(cat <<EXPECT
######
-TEST-
######
EXPECT
)
tested  "'diff_test' accepts input from two process substitutions"

} || true # force exit 0 when tests where not asked to run
##
# vim modeline
# /* vim: set filetype=sh shiftwidth=2 ts=2: */
