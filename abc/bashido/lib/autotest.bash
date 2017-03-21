# no shebang because this file is meant to be sourced by bash
##

echo "WARNING: autotest is not part of bashido now, use autotest directly"

# autotest is sourced at once with this file
autotest checkup || exit
source <(autotest)

# vim modeline
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
