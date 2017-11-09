#!/bin/bash

works () { echo "CODE OK"; }
fails () { echo "CODE NOT OK"; exit 1; }
count=0
tcase () {
  local title=$1 expect_status=$2 commands=$3
  (( count++ )); echo -e "\nINIT Test $count: Running $title\n · Should exit with code $expect_status";
  0> >(
    echo "$commands"
    $commands
  ) status=$?; echo -ne "DONE Test $count: EXIT CODE ($status) ";
  [[ $status == $expect_status ]] && echo "OK" || { echo "NOT OK (expected $expect_status)"; exit 1; }
}

source "$(bashido abc)";

tcase "exit with code 4" 4 'exit 4'
tcase "a test case expecting code 4 but receiving 3" 1 'tcase foo 4 "exit 3" &>/dev/null'
tcase "a test case expecting code 0 but receiving 1" 1 'tcase foo 0 "exit 1" &>/dev/null'


tcase "a 4 function chain that ends with call_trace" 0 'while read $l; do $l; done' <<CODE
  first(){ sec; }; sec(){ third; }; third(){ quad; }; quad(){ call_trace; };
CODE

#echo; echo "let's see a colored diff or something"; (  t(){ assert_e "AHH"; }; diff --color=always <( t )\ <( assert_e "AHH" )); echo "exit code was $?"
