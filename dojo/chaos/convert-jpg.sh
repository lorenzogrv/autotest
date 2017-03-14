#!/bin/bash
for f in ./*.png; do
  echo convert \"$f\" -compress jpeg $(sed -e 's/png/jpg/g' <<< "$f")
  convert "$f" -compress jpeg $(sed -e 's/png/jpg/g' <<< "$f")
done
