##
# outputs items of array referenced by variable name $1 joined with string $2
# - $2 is optional and defaults to ','
# Examples
# --------
# - FRUITS=( APPLE BANANA ORANGE "STAR FRUIT" ); printy_array "FRUITS"
# Reference
# --------
# - The trick to reference an array indirectly: store "${arrayname}[@]" previously
# - [iterate array ussing indirect reference](http://stackoverflow.com/a/25880676/1894803)
array_join () {
  local ref="${1?"$FUNCNAME: \$1 must be an string with array name"}[@]"
  local array=("${!ref?"Array $1 has length 0 or does not exist"}")
  local fs=${2:-','} # field separator
  # store on $result each array element followed by $fs
  local result; printf -v result "%s" "${array[@]/%/$fs}"
  echo "${result%$fs}" # Chop trailing $fs and output result
}
