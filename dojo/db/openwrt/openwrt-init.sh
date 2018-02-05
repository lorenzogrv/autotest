#!/bin/sh

for F in /etc/init.d/*
do
  $F enabled\
  && echo "  on $F"\
  || echo "*off $F"
done
