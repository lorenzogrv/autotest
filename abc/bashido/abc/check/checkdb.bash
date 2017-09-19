##
# Stores test data while running to ease inspection
_count=0
_title=()
_scope=()
_group=() # keys are gids, values group sizes
_items=() # keys are gids, values group lengths
_ended=()

#echo "iai-check runs for the 1st time"; set -x
checkdb () {
  case "$1" in
    # regarding _count
    isid|'is-$2-an-existing-test-id')
      is_int $2 || fail "$FUNCNAME $1: \$2 must be int but '$2' was given"
      test $_count -ge $2
      ;;
    # regarding _desc
    # TODO deprecate desc, deprecate describe=>title
    titleof|'get-title-of-id-$2')
      iai-checkdb isid $2 || fail "$FUNCNAME $1: id '$2' does not exit"
      if test -z "${_title[$2]}"; then
	fail "$FUNCNAME $1: missing desctription for test $2"
      fi
      echo "${_title[$2]}"
    ;;
    describe|'set-current-test-description')
      iai-checkdb idle && fail "cant set desc while idle"
      shift; _title[$_count]+="$@"
      #echo >&2 "[$$]#$BASH_SUBSHELL $FUNCNAME $1: $@'"
      ;;
    desc|'get-current-test-description')
      local current=$(iai-checkdb id) # id performs checks for idle state
      if test -z "${_title[$current]}"; then
	fail "$FUNCNAME $1: missing desctription for test $current"
      fi
      echo "${_title[$current]}"
      ;;
    # regarding _scope
    idle|'is-test-scope-empty') test ${#_scope[@]} -eq 0; ;;
    id|'get-current-test-id')
      iai-checkdb idle && fail "can't get id while idle"
      echo "${_scope[${#_scope[@]}-1]}"
      ;;
    deep|'get-current-test-deep') echo "${#_scope[@]}"; ;;
    idat|'get-current-test-id-at-deep-$2')
      # TODO: assert $2 is an int greater than -1 and less than "deep"
      echo "${_scope[$2]}";
      ;;
    # regarding _group hierarchy
    group|'is-$2-a-group') fail "$FUNCNAME $1 Deprecated. Use 'isgid'" ;;
    isgid|'is-$2-a-group-id')
      iai-checkdb isid $2 || fail "$FUNCNAME $1: id '$2' does not exit"
      is_int ${_group[$2]}
    ;;
    gsize|'get-$2-group-size')
      iai-checkdb isgid $2 || fail "$FUNCNAME $1: gid '$2' does not exit"
      echo ${_group[$2]}
      ;;
    items|'get-$2-group-items')
      iai-checkdb isgid $2 || fail "$FUNCNAME $1: gid '$2' does not exit"
      echo ${_items[$2]}
      ;;
    gidof|'get-$2-group-id')
      iai-checkdb isid $2 || fail "$FUNCNAME $1: id '$2' does not exit"
      # TODO polish algorithm
      # - compare and write tests for speed comparison before rewrite
      # - idea is take gid "x" less than $2 instead looping all numbers
      local id=$2; for (( n=id-1; n > 0 ; n-- )); do
	if iai-checkdb isgid $n; then
	  local size=$(iai-checkdb gsize $n)
	  if test "$2" -le "$(( n + size ))"; then break; fi
	fi
      done
      #eche "$FUNCNAME $1: gidof $2 is $n, gids are [${!_group[@]}]";
      echo $n
      ;;
    level|'get-$2-deep-level')
      iai-checkdb isid $2 || fail "$FUNCNAME $1: id '$2' does not exit"
      local deep=0 gid=$(iai-checkdb gidof $2)
      while test "$gid" -gt "0"; do
	gid=$(iai-checkdb gidof $gid)
	(( deep++ ))
      done
      eche "$FUNCNAME $1: deep of $2 is $deep"
      echo $deep
      ;;
    # regarding human-readable conversion of references
    refof|'get-$2-name-reference')
      iai-checkdb isid $2 || fail "$FUNCNAME $1: id '$2' does not exit"
      local gid=$(iai-checkdb gidof $2)
      local ref="$(($2-gid))"
      if test "$gid" -gt "0"; then
	ref="$(iai-checkdb refof $gid).$ref"
      fi
      #eche "$FUNCNAME $1: ref for $2 (gid=$gid) is [${ref[@]}]"
      echo $ref
    ;;
    name|'get-current-test-name')	
      iai-checkdb idle && echo >&2 "cant get name while idle" && exit 1
      {
      local array=() deduce=0
      for lvl in "${!_scope[@]}"; do
	local id=${_scope[$lvl]}   ;echo >&2 -n "$FUNCNAME $1: [id=$id]"
	local push=$((id-deduce))  ;echo >&2 -n " (id-deduce=$push)"
	if iai-checkdb isgid $id; then
	  echo >&2 -n " is a group (items=$(iai-checkdb items $id))"
	  (( deduce=id ))         ;echo >&2 -n " (now deduce=$id)"
	fi
	if test "$lvl" -gt "0"; then
	  local items=$(iai-checkdb items $(iai-checkdb idat $((lvl-1))))
	  if test "$push" -gt "$items"; then
	    (( push=id-items ))      ;echo >&2 -n " (now push=$push)"
	  fi
	fi

	array+=("$push")           ;echo >&2 -n " so name is $push"
	echo >&2 "."
      done
      } #2>/dev/null
      #eche "$FUNCNAME $1: [${_scope[@]}] turns into ${array[@]}"
      echo $(array_join array ".")
      ;;
    # main actions
    begin|'start-a-new-test') # triggered by 'that'
      local id=$(( ++_count ))
      { echo >&2 -n "[$$]#$BASH_SUBSHELL $FUNCNAME $1: new id=$id"
      if ! iai-checkdb idle; then
	local gid=$(iai-checkdb id) ; echo >&2 -n " gid=$gid"
	if iai-checkdb isgid $gid
	then (( ++_items[$gid] ))   ; echo >&2 -n " (items=${_items[$gid]})" 
	else _items[$gid]=1         ; echo >&2 -n " (new gid, items=1)"
	fi
	_group[$gid]=$((id-gid))   && echo >&2 -n " new size=$((id-gid))"
	echo >&2 -n " test $id is item ${_items[$gid]} of group $gid"
      else
	(( _items[0]++ ))
	echo >&2 -n " (root items =${_items[0]})"
	# "group #=${#_group[@]} [${_group[@]}]"
      fi
      _scope+=($id)	             && echo >&2 " scope=[${_scope[@]}]."
      } 2>/dev/null
      ;;
    end|'finish-current-test')
      iai-checkdb idle && fail echo "cant finish test while idle"
      local id=$(iai-checkdb id)
      unset _scope[${#_scope[@]}-1]
      _ended+=("$id")
      {
      echo >&2 -n "[$$]#$BASH_SUBSHELL $FUNCNAME $1: complete test $id"
      iai-checkdb isgid $id && echo >&2 -n " (gsize=$(iai-checkdb gsize $id))"
      echo >&2 " scope=[${_scope[@]}]."
      } #2>/dev/null
      ;;
    *) fail "$FUNCNAME error: bad argument list '$@'"; exit 1 ;;
  esac
}
