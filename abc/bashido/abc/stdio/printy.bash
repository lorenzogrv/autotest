
function printy () { fail "not implemented yet"; }

##
# pretty prints the array referenced by variable name $1
# Examples
# --------
# - FRUITS=( APPLE BANANA ORANGE "STAR FRUIT" ); printy_array "FRUITS"
# Reference
# --------
# - The trick to reference an array indirectly: store "${arrayname}[@]" previously
# - [iterate array ussing indirect reference](http://stackoverflow.com/a/25880676/1894803)
function printy_array () {
  local ref="${1?"$FUNCNAME: \$1 must be an string with array name"}[@]"
  local array=( "${!ref?"Array $1 has length 0 or does not exist"}" )
  echo "$1=("
  for key in "${!array[@]}"; do
    echo "  [$key]=\"${array[$key]}\""
  done
  echo ")"
}
