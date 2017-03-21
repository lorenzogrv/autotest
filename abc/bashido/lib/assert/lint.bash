# no shebang because this file is meant to be sourced by bash

source "$(bashido assert-basic)"
source "$(bashido assert-tdd)"

assert_head_equal () {
	local actual="$1" expect="$2"
	assert_reg_exists "$actual"
	assert_reg_exists "$expect"
	diff_test <(head -n $(wc -l <"$expect") "$actual") "$expect"
}
assert_tail_equal () {
	local actual="$1" expect="$2"
	assert_reg_exists "$actual"
	assert_reg_exists "$expect"
	diff_test <(tail -n $(wc -l <"$expect") "$actual") "$expect"
}
##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
