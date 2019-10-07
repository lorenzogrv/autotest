
# pass-through stdin data to stdout, but ensure its syntax matches ATP
function autotest--protocol.v1 () {
  local tlvl=0 clvl=0 count=0 fails=0 code=0 failed=0
  while read KEY value; do
    case $KEY in
      TEST)
        if test $tlvl -eq $clvl; then let tlvl++; else
          emsg "EATEST: premature 'TEST $value' statement (expecting CODE)"
          return 5
        fi
        read -d ' ' filepath <<<"$value"
        if ! test -f "$filepath"; then
          emsg "EATEST: '$filepath' is not a file"
          return 127
        fi
        emsg "debug autotest: tlvl=$tlvl; reset count, fails, code"
        count=0 fails=0 code=0
        ;;
      FAIL|PASS|SKIP)
        if test $clvl -eq $tlvl; then
          emsg "EATEST: premature '$KEY $value' statement (expecting TEST)"
          return 5
        fi
        (( count++ ))
        test "$KEY" == "FAIL" && (( fails++ ))
        ;;
      CODE)
        if test $clvl -lt $tlvl; then let clvl++; else
          emsg "EATEST: premature 'CODE $value' statement (expecting TEST)"
          return 34
        fi
        read -d ' ' code <<<"$value"
        if ! is_int "$code" || test $code -gt 255; then
          #echo "CODE 2${value##$code}"
          emsg "EATEST: invalid code '$code'"
          return 44
        fi
        # remember how many CODE statements report a failure
        if test $code -gt 0; then let failed++; fi
        if test $count -eq 0
        then # test ended without any assertion statement
          echo "FAIL there are no assertions in this test"
          (( failed++ ))
          echo "CODE 1${value##$code}" # TODO code empty
          continue #parsing but don't pass-trough
        elif test $code -eq 0 && test $fails -gt 0
        then # code is 0 but there are failures
          echo "FAIL test exit status code was 0 with $fails failures"
          (( failed++ ))
          echo "CODE 1${value##$code}"
          continue #parsing but don't pass-trough
        elif test $code -eq 0 && test $failed
        then # code is 0 but some previous test units failed
          emsg "FAIL there are $failed test unit failures above"
          (( failed++ ))
          echo "CODE 1${value##$code}"
          continue #parsing but don't pass-trough
        else
          emsg "debug autotest: code=$code count=$count fails=$fails failed=$failed"
        fi
        ;;
      *) emsg "bad syntax: '$keyword $value'"; return 5 ;;
    esac
    echo "$KEY $value" # pass data down through pipeline
  done
  if test $tlvl -eq 0 ; then
    emsg "EATEST: expecting at least one TEST statement"
    return 5
  fi
  # when the last CODE statement is missing, generate one
  if ! test $tlvl -eq $clvl; then
    emsg "debug autotest: generate CODE count=$count fails=$fails failed=$failed"
    if ! (($count)); then echo "FAIL empty test"; code=3
    elif (($fails)); then code=1
    elif (($failed)); then echo "FAIL a previous unit failed"; code=1
    fi
    echo "CODE $code"
  fi
  return $code # return the last stored code allways
}

##
# vim modeline (see vim +'help modeline')
# /* vim: set expandtab: */
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
