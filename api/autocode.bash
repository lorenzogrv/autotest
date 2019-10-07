
# Tells whenever given value ($1) is an integer
is_int () { case "${1#[-]}" in ''|*[!0-9]*) return 1;; *) return 0;; esac; }

function autocode () {
  # maps known exit status codes to codenames and vice-versa
  (( $# > 1 )) && {
    echo "$FUNCNAME expects ONE or NONE arguments" >&2
    exit 2
  }
  case "${1^^}" in
    0) echo OK      ;; OK)     echo 0   ;; # success code
    1) echo FAIL    ;; FAIL)   echo 1   ;; # generic failure code
    2) echo EUSAGE  ;; EUSAGE) echo 2   ;; # incorrect command ussage
    3) echo EXCODE  ;; EXCODE) echo 3   ;; # invalid exit status code
    # reserve through 9
    #[4-9]) echo ETEST"autotest protocol error (reserved)" ;;
    10) echo EATEST ;; EATEST) echo 10  ;; # Autotest Syntax Error
    11) echo EAOPEN ;; EAOPEN) echo 11  ;; # Open TEST unit (missing CODE)
    12) echo EAVOID ;; EAVOID) echo 12  ;; # Void TEST unit (nothing inside)
    13) echo EACODE ;; EACODE) echo 13  ;; # CODE statement exit status mismatch
    14) echo EAFLOW ;; EAFLOW) echo 14  ;; # unexpected statement (premature)
    # special cases
    124) echo EATIME;; EATIME) echo 124 ;; # operation timeout
    126) echo EACCES;; EACCES) echo 126 ;; # can't execute (no permission)
    127) echo ENOENT;; ENOENT) echo 127 ;; # entity not found (file/dir/...)
    # signals are 129 through 192 (128 + signal code)
    SIG*) echo $(( 128 + $(kill -l $1) )) ;;
    160|161) echo $1; return 1 ;; # TODO why signals 32 and 33 don't exist?
    129|1[3-8][0-9]|19[0-2])
      echo "SIG$(kill -l $(($1-128)))" ;;
    describe)
      echo "this feature is not implemented" >&2
      exit 1
      ;;
    '')
      for i in {0..255}; do
        autocode $i &>/dev/null && printf "$i → %s\n" "$(autocode $i)"
      done
      return 1
      ;;
    *)
      is_int "$1" && (($1 >  255)) && {
        echo "code '$1' invalid" >&2
        exit 2
      }
      echo "$1"
      echo "$FUNCNAME: no error code information for '$1'" >&2
      return 1
      ;;
  esac
}

##
# vim modeline (see vim +'help modeline')
# /* vim: set expandtab: */
# /* vim: set filetype=sh ts=2 shiftwidth=2: */
