# The iai-abc package

This package holds every source **citation need to source definition** that
is used internally by the iai-api modules (packages inside `api/` directory).

The package itself is contained within the `abc/` directory.

The rule: If something under `api` depends on it, it belongs here. Ofc this
does not apply when it belongs to the api module itself.

## TODO

- [ ] The `abc/` directory should be a git repository
- [ ] That repository should be added as submodule on the iai repository
- [ ] The iai-oop package should be added as submodule for the iai-abc
      repository (at `oop/`).
- [ ] The iai dependency on iai-oop should be removed

Good luck dealing with the git-submodule thing ^^U

## LICENSE INFO

This is a work in progress not release-ready so no license has been chosen yet.
