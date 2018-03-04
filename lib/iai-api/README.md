# The iai-api package

iai submodules which are **fully independent between them**.

> This statement is weak, there are modules within the "abc" thing that
> are _fully independent between them_ too.

They usually depend on code from `abc`.

> This statement is weak too, it's need a better rule to determine when a thing
> belongs here or at `abc`. A first tought was "if it logs something" but note
> the log itself logs-out, so that means it belongs here. Process bindings
> (`abc/lib/process`) also write logs.

The iai-api package is simply a wrapper to store this modules, that should
be packages on its own.

## LICENSE INFO

This is a work in progress not release-ready so no license has been chosen yet.
