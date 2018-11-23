#!/bin/bash

## research the directory where this script is stored
# http://stackoverflow.com/a/246128/1894803
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

##
# Quick'n dirty way to display end notification
END_CMD="$DIR/launcher.sh end_notify"
if [[ $1 == "end_notify" ]]
then
    say_ok "O cliente de Synergy finalizou a execución."
    exit 0
fi

#
# Comprobar que o cliente non está en marcha
pstree | grep synergyc > /dev/null\
    && say_ok "O cliente de Synergy xa se está a executar"\
    && exit 1

#
# Lanzar o cliente
synergyc -f --no-restart --enable-crypto \
    -l /tmp/synergy.log -d NOTE \
    192.168.2.190 &
SYN_PID=$!
#say_ok "O PID de synergy é $SYN_PID."

#
# Monitorizar o log
tail -n 0 -f /tmp/synergy.log | while read line; do\
    ## remove log messages being paths to files...
    [[ $line != /* ]] && say_log "$line"; done &
LOG_PID=$!
#say_ok "O PID do logger é $LOG_PID."

# fix para o keyboard map 
setxkbmap $(setxkbmap -query | grep "^layout:" | awk -F ": *" '{print $2}')
say_ok "Iniciouse o cliente e aplicouse o fix para o keyboard mapping"

$DIR/killer.sh $SYN_PID $LOG_PID $END_CMD &
