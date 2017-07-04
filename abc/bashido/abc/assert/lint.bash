# no shebang because this file is meant to be sourced by bash

source "$(bashido abc.common)"
bashido.require "assert.errors"
bashido.require "assert.equal"

assert_head_equal () {
	local actual="$1" expect="$2"
	assert_reg_exists "$actual"
	assert_reg_exists "$expect"
	diff_test <(head -n $(wc -l <"$expect") "$actual") "$expect" || {
		utip "try the following commands to quick-fix the problem:"
		utip "    cd $PWD"
		utip "    mv $actual $actual.old"
		utip "    cat $expect $actual.old > $actual"
		utip "    rm $actual.old"
		exit 1 # TODO EALINT or the like
	}
}
assert_tail_equal () {
	local actual="$1" expect="$2"
	assert_reg_exists "$actual"
	assert_reg_exists "$expect"
	diff_test <(tail -n $(wc -l <"$expect") "$actual") "$expect" || {
		utip "try the following commands to quick-fix the problem:"
		utip "    cat $expect >> $actual"
		exit 1 # TODO EALINT or the like
	}
}
##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
