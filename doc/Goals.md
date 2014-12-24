# Goals

This document describes what are the goals of the project. How to reach these
goals, will come later.

> iai is a ~~general purpose solution~~ tool to automate the software development
> process of web based applications, dramatically reducing the time needed
> to succesfully deliver ready-to-use features.


## Overall life-cycle goals

> What *iai* should contribute to the development life-cycle of any
> application.

### *As fast as say iai*

Developing with *iai* should be as fast as saying the word, once developers
dived through the learning curve.

### Agile

> aka *adaptability to changes*

*iai* should maximize the reusability of every project's code, even between
projects, while minimizing the impact of changes on any package or component.

### Methodology driven

*iai* should behave in concordance to the development methodology chosen to
manage the life cycle of the project, whatever methodology, behaving naturally
to the developing process.

### Ease continuity practices

*iai* should ease the continuity practices - integration, delivery, and
deployment - through automated processes.


## Technical goals

> What *iai* should depend on, and should not depend on.

### Easy integrable

*iai* should be easy integrable with existing tools, being a complement to
the industry de-facto standards rather that a wrapper for them.

### Structure independent

*iai* should not assume a project structure, it should be a tool to discover -
or create - and arrange that structure *on the fly*.

### Scalable and distributable

*iai* should produce scalable applications consisting in a set of easy
redistributable components, allowing to scale up the infrastructure as the
project growths.

### Minimalistic and lightweight

The *iai* main package should only provide the features that developer needs,
and never provide features that *"overkill"* application requeriments.

### Standards compliant

When a standard specification exists on any field that iai works with, and
that standard it's known to be well-suited for its purpose, *iai* should be
based on it. Even when a standard specification is being drafted, and it's
known to will be well-suited for its purpose, *iai* should be based on it.

## Code style goals

> How *iai* should look when reading its code, or the code produced with it.
>
> The following has more to be with how the code is written that with what
> it actually does. Coding style play a fundamental role when communicating
> between developers (even between a developer and himself), so a clean code
> style is a must to succeed.

### Natural

The *iai* api should be expresive and not verbose.

### Simple

> Towards the callback ~~hell~~ heaven

*iai* should aid on managing the code flow, specially on complex flows
like the asynchronous environment.

### Fluid

> Strongly inspired by the jQuery's *"write less, do more"*

Chainable apis are beautiful to read. The code flows through the chain
like saying *1, 2, 3... iai*. Caution with chainable apis that in
practice hide the code natural flow, difficulting its read.