
function math () { fail "not implemented"; }

##
# Sums any number of arguments passed in
# from http://unix.stackexchange.com/a/98934/49721
# TODO
# · test it works
# ? replace $* with $@
function math.sum () { local IFS=+; echo "$(($*))"; }
