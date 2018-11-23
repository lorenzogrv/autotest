#!/bin/bash

SYN_PID=$1
LOG_PID=$2
END_CMD=$3

#notify-send 'Vixiante de `synergyc`' "Monitorizando o proceso." -i info

while kill -0 "$SYN_PID" >/dev/null 2>&1; do
    sleep 5
done

#notify-send 'Vixiante de `synergyc`' "O proceso finalizou." -i info
kill $LOG_PID
$END_CMD end_notify
