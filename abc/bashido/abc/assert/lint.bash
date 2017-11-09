# no shebang because this file is meant to be sourced by bash

bashido.require "assert.errors" || exit
bashido.require "assert.equal" || exit

assert_head_equal() { fail "$FUNCNAME deprecated. Use %s" lint.head_equals; }
assert_tail_equal() { fail "$FUNCNAME deprecated. Use %s" lint.tail_equals; }

function lint () { fail "$FUNCNAME not implemented"; }

lint.head_equals () {
	local actual="$1" expect="$2"
	assert_reg_exists "$actual"
	assert_reg_exists "$expect"
	diff_test <(head -n $(wc -l <"$expect") "$actual") "$expect" || {
		emsg "file %s" "$actual"
		emsg "does not begin with the contents of"
	  emsg "%s" "$expect"
		utip "try the following one-liner to quick-fix the problem: %s"\
			"mv '$actual' '$actual.old'\
		 	&& cat '$expect' '$actual.old' > '$actual'\
		 	&& rm '$actual.old'\
		 	&& echo FIX APPLIED || echo FIX FAILED"
		utip "or use %s instead." "vim '$actual'"
		fail "EALINT"
		exit 1 # TODO EALINT or the like
	}
}

lint.tail_equals () {
	local actual="$1" expect="$2"
	assert_reg_exists "$actual"
	assert_reg_exists "$expect"
	diff_test <(tail -n $(wc -l <"$expect") "$actual") "$expect" || {
		emsg "file %s" "$actual"
		emsg "does not end with the contents of"
	  emsg "%s" "$expect"
		utip "try the following one-liner to quick-fix the problem: %s"\
			"cat '$expect' >> '$actual'"
		utip "or use %s instead." "vim '$actual'"
		fail "EALINT"
		exit 1 # TODO EALINT or the like
	}
}
##
# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
