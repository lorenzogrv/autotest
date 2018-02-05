
gpio_in () {
  grep -e "gpio-$1.*in" /sys/kernel/debug/gpio
}

gpio_in_hi () {
  grep -qe "gpio-$1.*in  hi" /sys/kernel/debug/gpio
}

gpio_18 () { gpio_in_hi 18; }
gpio_20 () { gpio_in_hi 20; }

mode_sw () {
  if gpio_18
  then
    if gpio_20
    then
      echo "AP"
    else
      echo "3G"
    fi
  else
    echo "WISP"
  fi
}

mode_sw
