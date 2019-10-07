
##
# THE AUTOTEST PROTOCOL (ATP)
#
# TODO write about present and future
# TODO i.e. "PLAN statement", "TIME statement", etc...
# TODO "INFO"/"VERB"?
#
# > Be able to gracefully handle future upgrades, being forward compatible.
# >   - Ignore unknown directives
# >   - Ignore any unparsable lines
# >
# > > inspired by http://testanything.org/philosophy.html
##

function autotext () {
  # pass-through stdin data to stdout, but ensure its syntax matches ATP
  local FAILS=0 FAILED=0 TESTS=0 CODES=0 COUNT=0 
  local ETC CODE READCODE
  while read -t 2 KEY VAL; READCODE=$?
  do # each line consists of a leading KEYWORD with VALUE data
    case "$KEY" in
      TEST)
        verb "TEST hit with codes=$CODES tests=$TESTS"
        (($CODES == $TESTS)) || return $(autocode EAOPEN)
        let TESTS++; FAILS=0; COUNT=0
        ;;
      FAIL|PASS|SKIP)
        (($CODES == $TESTS)) && return $(autocode EAFLOW)
        case $KEY in FAIL) let FAILS++;; PASS) let COUNT++;; esac
        ;;
      #SKIP) : ;;
      CODE)
        verb "CODE hit with codes=$CODES tests=$TESTS"
        case "${VAL}" in
          '') # empty status code means "generate a code now"
            verb "generate code, count=$COUNT fails=$FAILS"
            VAL="$(autocode OK) OK"
            (($COUNT)) || VAL="$(autocode EAVOID) EAVOID"
            (($FAILS)) && VAL="$(autocode FAIL) FAIL"
            ;;
        esac
        read CODE ETC <<<"$VAL"
        is_int $CODE && (($CODE < 256)) || return $(autocode EXCODE)
        let CODES++; (($CODES == $TESTS )) || return $(autocode EAFLOW)
        # statement was succesfully validated
        verb "statement is code=$CODE etc='$ETC', fails=$FAILS, count=$COUNT"
        ;;
      '') # did not find a way to work with read code outside while loop
        verb "read key=$KEY code=$READCODE"
        test $READCODE -eq 1 && break # presumably, we hit end-of-file
        test $READCODE -gt 128 && {
          echo "CODE $(autocode EATIME)"
          return $(autocode EATIME)
        }
        return $(autocode EATEST) # if it's not timeout, it's syntax error
        ;;
      *) return $(autocode EATEST) ;;
    esac
    # pass data down through pipeline, done if KEYWORD != CODE
    echo "$KEY $VAL"; test "$KEY" != "CODE" && continue
    # decide if parsing process should continue
    case "$(autocode $CODE)" in
      OK) # reported success, but ensure it's correct
        (($FAILS)) && return $(autocode EACODE)
        (($COUNT)) || return $(autocode EAVOID)
        ;;
      EAVOID|EATIME) break ;; # stop parsing
      *) # reported failure, but ensure it's correct
        (($FAILS)) || return $(autocode EACODE)
        #((COUNT + FAILS)) || return $(autocode EAVOID)
        let FAILED++
        ;;
    esac
  done
  verb "generate return tests=$TESTS codes=$CODES"

  (( TESTS - CODES )) && return $(autocode EAOPEN)
  verb "generate return tests=$TESTS"
  (( $TESTS )) || return $(autocode EAVOID)
  verb "generate return code=$CODE"
  (( $CODE )) && return $CODE
  verb "generate return failed=$FAILED"
  (( $FAILED )) && return $(autocode FAIL)
  return $CODE 
}

##
# vim modeline (see vim +'help modeline')
# /* vim: set expandtab: */
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
