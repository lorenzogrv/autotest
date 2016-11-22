##
# Sums any number of arguments passed in
# from http://unix.stackexchange.com/a/98934/49721
# TODO
# · test it works
# ? replace $* with $@
math_sum () { local IFS=+; echo "$(($*))"; }
