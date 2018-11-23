#!/bin/bash

# http://stackoverflow.com/questions/59895/can-a-bash-script-tell-which-directory-it-is-stored-in
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

# http://ubuntuforums.org/showthread.php?t=1411620
# https://specifications.freedesktop.org/icon-naming-spec/icon-naming-spec-latest.html
notify () {
    # comillas dobles para escapar posibles espacios no path
    notify-send  "$1" "$2" -i ""${DIR}/${3}""
} 
say_ok () { notify "Estado de \`synergyc\`" "$1" "synergy.ico"; }
say_log () {  notify "Log do cliente de Synergy" "$1" "synergy.ico"; }

