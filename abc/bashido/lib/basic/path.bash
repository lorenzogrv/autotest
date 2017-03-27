
basename_split () {
	local basename="$(basename "$file")"
	# `man bash`, search for "Parameter Expansion"
	local prefix="${basename%%\.*}"
	local suffix="${basename#*\.}"
	verb "basename=$basename prefix=$prefix suffix=$suffix"
	echo "'$basename' '$prefix' '$suffix'"
}
