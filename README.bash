local NAME="$(basename "$(type -p autotest)")"

# TODO split this file on parts (i.e. USSAGE, USSAGE-SUBCOMAND, etc)
cat <<HELP
Ussage: $NAME [SUBCOMMAND|FILE] [ARGUMENT .. LIST]

- '$NAME <FILE> [ARGUMENT .. LIST]': executes test script <FILE> (see below)
- '$NAME <SUBCOMMAND> [ARGUMENT .. LIST]': executes <SUBCOMMAND> (see below)
- '$NAME' without arguments prints all api source code on stdout (see below)
- '$NAME help | $NAME --help | $NAME -h': prints this help text

FILE Ussage: $NAME <FILE> [ARGUMENT .. LIST]
  
  executes <FILE> with [ARGUMENT .. LIST] through a pipe to '$NAME -'

  When file is '-', asserts that data read from stdin is valid AutoTestProtocol
  data (or ATP) right after copying stdin data to stderr. This mode will always
  produce sintactically valid ATP data on stdout - but may produce semantically
  invalid TEST units as will not perform semantic validations.

  For semantic validation, use '$NAME report <FILE> [ARG .. LIST] instead.

  '$NAME -' will fail verbosely on stderr when data read is not valid ATP - but
  will continue running. Aditionally, will return the exit status code of those
  known by '$NAME code' that results from the whole test suite, as described by
  the ATP data read, according to the ATP specification.

SUBCOMMAND Ussage: $NAME <SUBCOMMAND> [ARGUMENT .. LIST ]

- '$NAME report <FILE> [ARG .. LIST]': similary to '$NAME <FILE> [ARG .. LIST],
                                       but performs semantic validations too.
  
  ATP spec states that any TEST statement should describe the command issued to
  run that test unit, but to avoid time and resource costs of this 'recreation'
  (each TEST statement requires running the unit again to compare back'n-forth)
  this semantic validation is only performed when issued to do so.

- '$NAME root'   : prints the autotest root directory on stdout
- '$NAME code [N]: prints codename of known exit code number [N] or vice-versa.
                   without [N], prints a list of all known exit codes on stdout
                   returns 1 if codename [N] or code number [N] is not known
                   returns 0 if codename [N] or code number [N] is known
- '$NAME checkup': asserts that $NAME's old-api functions behave as expected
                   TODO should run the full $NAME test suite


API Code examples (for old api):

  - \`source <(autotest)\`: sources the autotest code for later usage
  - \`autotest checkup && source <(autotest) || exit\`: assert autotest api
    functions behave as they should before sourcing autotest, or abort execution
HELP
