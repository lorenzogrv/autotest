##
# Print a call stack trace to stdout, meant to be read by an human
# - arg $1: callsite to begin the trace. Defaults to 1
# - example: `echo -e "OMG! WTF? call stack:\n$(call_site)\n Fatal error! see above."`
# - Awesome: 'Read columns from input through herestring redirection'
#   - Learn "here strings": http://wiki.bash-hackers.org/syntax/redirection#here_strings
#   - Learn "caller" and "read": `help read; help caller`
# - Learn amazing tables with printf format: `man printf; man 3 printf`
# - TEST: (source helper.bash; first(){ sec; }; sec(){ third; }; third(){ quad; }; quad(){ call_trace; }; first)
# TODO better output format ?
call_trace () {
  local n=${1:-0} below=$(printf 'v%.0s' {1..20}) above=$(printf '^%.0s' {1..20})
  # not elegant, but working "repeat char n times" - from http://stackoverflow.com/a/5349842/1894803
  printf "$below TRACE BELOW $below\n"
  printf "call%20s %-3s /path/to/file\n" "routine name" "line"
  while callsite=$(caller $n); do
#	  {  echo "${#callsite[@]} elements on '${callsite}'"; }
    read line fn file <<< "$callsite"
    file="${file//main/${BASH_SOURCE[0]}}"
    file="${file#$PWD/}" # remove cwd from file paths
    printf " %-2s %20s %-3s %s\n" "$n" "$fn" "$line" "$file"
    (( n++ ))
  done
  printf "$above TRACE ABOVE $above\n"
}

