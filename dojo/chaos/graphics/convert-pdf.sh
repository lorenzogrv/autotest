#!/bin/bash
for f in ./*.png; do
  echo convert $f -compress jpeg $(tr png pdf <<< $f)
  convert $f -compress jpeg $(tr png pdf <<< $f)
done
