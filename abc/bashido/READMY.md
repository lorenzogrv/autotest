# Notes about this directory

This directory stores the bash code **TO BE SOURCED**.

**Forgive _is-being-sourced_ tests** like ideas at:
- http://unix.stackexchange.com/a/299621/49721
- http://stackoverflow.com/questions/2683279/how-to-detect-if-a-script-is-being-sourced

At least, forgive that tests for a while. It adds complexity. **KISS please**.


> 2016-11-17 06:44:13+01:00

- It's too early to succesfully stablish a project directory structure
- Avoid prematurity applies here.
- On the while, bash code meant to be `source`'d, goes here.
- Use a path resolver (like `iai dir` or so) to research paths to the source files.
- That way, at future, will be easier to re-arrange this directory and its contents.

> vie dic  2 14:53:59 CET 2016

- While it's too early to stablish directory structure, it's not to stablish a
  minimal name convention to name bash source files inside this directory.
- The main rule is: given a **sorted** list of the file names, any file can
  depend upon code from files sorted above, but can not depend on those sorted
  below.

> 2017-07-07 01:53:58+02:00

- Renamed "abc" to "api". api will contain the basic api to use within scripts
- The way code is sourced actually don't eases arrangement of the feature names
