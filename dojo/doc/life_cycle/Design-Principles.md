# The iai design principles

<article><a name="TOC"></a>

## Table of contents

- [Principles for principle research (READ)](#READ)
  - [Rely on the software community experience](#rEAD)
  - [Extract conclusions thoroughly](#ReAD)
  - [Availability to improve continuosly](#REaD)
  - [Defend Against bad design](#REAd)

- [Avoid relapsing on known blunders](#blunders)
  - [Don't reinvent the wheel](#wheel)
  - [The **KISS** principle: Keep it simple](#KISS)
  - [The **DRY** principle: Don't Repeat Yourself](#DRY)
  - [Avoiding *prematurity* (**YAGNI**, **the rule of three**, and others)](#prematurity)
  - [Prefer convention over configuration](#COC)

- [Follow de principles of OOD](#OOD)
  - [**SOLID**: The five principles of objects design](#SOLID)
    - [**S**: The single responsibility principle](#sOLID)
    - [**O**: The open-closed principle](#SoLID)
    - [**L**: The Liskov substitution principle](#SOlID)
    - [**I**: The interface segregation principle](#SOLiD)
    - [**D**: The dependency inversion principle](#SOLId)
  - [The six principles about package design](#OOD-pack)
    - [Package cohesion](#pack-cohesion)
      - [The Reuse/Release Equivalency Principle](#pack-RREP)
      - [The Common Closure Principle](#pack-CCP)
      - [The Common Reuse Principle](#pack-CRP)
    - [Loose coupling](#loose-coupling)
      - [The Acyclic Dependencies Principle](#DAG)
      - [The Stable Dependencies Principle](#stability)
      - [The Stable Abstractions Principle](#abstractness)

</article>

* * *

<section><a name="READ">[go to TOC](#TOC)

## Principles for defining principles (READ)

[Rebecca J. Wirfs-Brock]: http://wirfs-brock.com/blog
[Principles in Practice]: http://www.wirfs-brock.com/PDFs/PrinciplesInPractice.pdf
[rule of thumb]: http://en.wikipedia.org/wiki/Rule_of_thumb

Keep in mind the value of design principles for defining the design
principles.

> A good design principle should help generate ideas and enable you to
> think through design implications
>
> _([Rebecca J. Wirfs-Brock], [Principles in Practice] @ 2009)_

A good design principle should include at least one [rule of thumb] to ease
its application in practice.

<article><a name="rEAD"></a>[go to TOC](#TOC)

#### Rely on the software community experience

[@laconbass]: http://lorenzogrv.com
[issue #1]: https://github.com/laconbass/iai/issues/1#issuecomment-44346366

> No individual has the absolute knowledge about something, the whole
> community has the absolute knowledge about anything.
>
> _([@laconbass], [issue #1] @ 2014)_

Be aware of the principles that are the foundation of the disciplines that
programming languages were derived around, and especially of the experience
from years of research by the sofware development community. Research
through them to define design principles.

**The [rule of thumb]: Don't trust self-proclaimed gurus**

Don't adopt assertions from individuals if there is an argued discussion on
the community about that assertions being possible fallacies. Trust
assertions when community support them widely.

</article>

<article><a name="ReAD"></a>[go to TOC](#TOC)

### Extract conclusions thoroughly

Do a granular research and **don't put just a link**, principles must be
reasoned. That said, link references to relevant articles are a must for
future awareness. Condense the basics while providing references to deep
into the concepts, avoid unnecessarily long definitions.

_This principle will be difficult to apply until it has a [rule of thumb]._

</article>

<article><a name="REaD"></a>[go to TOC](#TOC)

### Availability to improve continuously

Every principle should be reviewed often, without being afraid of changing
it. Like experience evolves, knowledge also evolves, like the whole software
community evolves. That said, this principles should not change, except on
major releases, to keep consistency.

_This principle will be difficult to apply until it has a [rule of thumb]._

</article>

<article><a name="REAd"></a>[go to TOC](#TOC)

### Defend against bad ~~design~~ ideas

The design principles must be a tool to detect bad designs, a guide to
measure the strongness or weakness of designs. That's the key to anticipate
and avoid future maintainability troubles.


_This principle will be difficult to apply until it has a [rule of thumb]._

</article>

</section>

* * *

<section><a name="blunders"></a>[go to TOC](#TOC)

## Avoid relapsing on known blunders

[Anti Patterns]: http://c2.com/cgi/wiki?AntiPattern
[lots of known practices]: http://c2.com/cgi/wiki?AntiPatternsCatalog

There are [lots of known practices], some really old and some not so, that are
identified as bad practices (aka [Anti Patterns]).

Some are specially important to keep in mind while designing. This section
holds mnemonics to remember those blunders, including causes and possible
solutions to step over them.

<article><a name="wheel"></a>[go to TOC](#TOC)

#### Don't reinvent the wheel

[reinventing the wheel]: http://c2.com/cgi/wiki?ReinventingTheWheel
[NIH syndrome]: http://c2.com/cgi/wiki?NotInventedHere
[differentiate Reinventing vs. Redefining]: http://c2.com/cgi/wiki?PleaseReinventTheWheel
[please reinvent the wheel]: http://c2.com/cgi/wiki?PleaseReinventTheWheel

It's a common mistake *[reinventing the wheel]*, as a kind of redundant
effort. For clarification of what this means:

> Unnecessarily performing a task that has already been successfully
> completed by others.
>
> _([reinventing the wheel] on the c2 wiki)_

**This often happens because of the [NIH syndrome].**

> Mental note (for [@laconbass]): You suffer noticeably the [NIH syndrome].
                                  Take care.

**The [rule of thumb]: Differentiate Reinventing vs. Refining or
Re-implementing.**

> Re-invention is when you come up with the solution independently, because
> you haven't bothered to look to see if someone solved it before, not when
> you re-implement a solution you already know about.
>
> **[reinventing the wheel] implies that out of sheer ignorance or
> stupidity**, you are re-doing the hard work that someone has already done
> (and everyone but you knows about it). Making incremental improvements to
> the wheel, making a wheel out of a new material (or language), etc. is
> **not** [reinventing the wheel].
>
> _([please reinvent the wheel] on the c2 wiki)_

</article>

<article><a name="KISS"></a>[go to TOC](#TOC)

#### The KISS principle: Keep it Simple

[Richard A.C. Hoare]: http://en.wikipedia.org/wiki/Tony_Hoare
[The Emperor's Old Clothes]: http://worrydream.com/refs/Hoare%20-%20The%20Emperors%20Old%20Clothes.pdf
[keep it simple]: http://c2.com/cgi/wiki?KeepItSimple
[David Hooker]: http://c2.com/cgi/wiki?DavidHooker
[Seven Principles Of Software Development]: http://c2.com/cgi/wiki?SevenPrinciplesOfSoftwareDevelopment
[Martin Fowler]: http://martinfowler.com/
[Refactoring Improving the Design Of Existing Code]: http://martinfowler.com/books/refactoring.html

> There are two ways of constructing a software design: one way is to make
> it so simple that there are obviously no deficiencies; the other way is
> to make it so complicated that there are no obvious deficiencies. The
> first method is far more difficult.
>
> _([Richard A.C. Hoare], [The Emperor's Old Clothes] - 1981)_

This principle is mentioned in thousands of sites, also at [keep it simple]
on the c2 wiki. A pretty nice definition:

> **All design should be as simple as possible, but no simpler.**
>
> _([David Hooker], [Seven Principles Of Software Development] 1996? 1999?)_

Simplicity is, in fact, complex to achieve. A common mistake when designing
architecture is to introduce too complexity on the system trying to reach
an nonexistent status of "perfectness", which is not achievable.

An example in practice: while designing, do the following sequence:

1. Start from the very simple sketch (very few elements).
2. As relations between components evolve, observe the obvious
   deficiences that will break with the design principles.
3. Fix the deficiencies, even introducing complexity on the design.
4. Observe the other deficiencies now appeared.
5. Repeat 3 and 4 until there are *no obvious deficiencies*.
6. Now the system is **too complex**.

**A [rule of thumb]: There's no perfect system.** Simplicity and
complexity must be balanced to accomplish some kind of _equilibrium_ .
The perpetual balance is a panacea - not possible - so **apply simplicity
and complexity as a strategy to solve problems, not to reach the
perfectness**.

**TODO**

- [ ] A good read may be [Refactoring Improving the Design Of Existing Code]
      by [Martin Fowler] at 1999 _(L. @ January 2015)_

</article>

<article><a name="DRY"></a>[go to TOC](#TOC)

### The DRY principle: Don't Repeat Yourself

[don't repeat yourself]: http://c2.com/cgi/wiki?DontRepeatYourself
[once and only once]: http://c2.com/cgi/wiki?OnceAndOnlyOnce
[the single source of truth]: http://en.wikipedia.org/wiki/Single_Source_of_Truth

> Every piece of knowledge must have a single, unambiguous, authoritative
> representation within a system.
>
> _([don't repeat yourself] at the c2 wiki])_

Duplication (inadvertent or purposeful) can lead to maintanance nightmares,
poor factoring, and logical contradictions. Duplication, and the strong
possibility of eventual contradiction, can arise anywhere: in architecture,
requeriments, code, or documentation. This effects can range from
mis-implemented code and developer confusion to complete system failture.

**The [rule of thumb]: It's ok to have mechanical, textual duplication** (a 
repeatable, automatic derivation of one source file from some meta-level
description), **as long as the authoritative source is well known.**

This principle is related to [once and only once], but with a different
objective: The latter encourages to *refactor to eliminate duplicated code
and functionality*, while the former encourages to *identify the single,
definitive source of every piece of knowledge used in the system* -
[the single source of truth] - and use that source to generate applicable
instances of that knowledge (code, documentation, tests, etc).

</article>

<article><a name="prematurity"></a>[go to TOC](#TOC)

### Avoid prematurity

[premature anything]: http://c2.com/cgi/wiki?PrematureAnything
[premature generalization]: http://c2.com/cgi/wiki?PrematureGeneralization
[generalization]: http://c2.com/cgi/wiki?WhatIsGeneralization
[YAGNI]: http://c2.com/cgi/wiki?YouArentGonnaNeedIt
[KISS]: #KISS
[premature optimization]: http://c2.com/cgi/wiki?PrematureOptimization
[Donald Knuth]: http://www-cs-faculty.stanford.edu/~uno/
[Structured Programming with goto statements]: http://c2.com/cgi/wiki?StructuredProgrammingWithGoToStatements
[premature standardization]: http://c2.com/cgi/wiki?PrematureStandardization
[rule of three]: http://c2.com/cgi/wiki?RuleOfThree

> If it's _premature_, then it's too early for whatever it is you have in
> mind, so don't do it (if you're able to not).
>
> _([premature anything] on the c2 wiki)_

This specially related to [premature generalization], which may appear when
applying the DRY principle. Care must be taken to avoid wasting time on
useless generalizations. Quite often, premature [generalization] happens
when one sets out to "solve the general case" for a specific requirement.
**While general solutions are often "better" by some measure, the act of
deriving them carries risk, particularly when the requirements for a general
solution are imagined (thus not real).**

**A [rule of thumb]: You Aren't Gonna Need It ([YAGNI])**:

> "Always implement things when you **actually** need them, never when you
> just **foresee** that you need them."

This doesn't mean you should avoid building flexibility into your code. It
means **you shouldn't overengineer something based on what you think you
might need later on**. This also helps on following the [KISS] principle.

**Another [rule of thumb]: The [rule of three]:**

> A pattern can be called a pattern only if it has been applied to a real
> world solution at least three times.

**It takes three times as much effort to make something reusable as to make
it usable**.

**Another [rule of thumb]: avoid [premature optimization]**.

> Programmers waste enormous amounts of time thinking about, or worrying
> about, the speed of noncritical parts of their programs.
>
> [Donald Knuth], [Structured Programming with goto statements]

**Another [rule of thumb]: avoid [premature standardization]**.

> The amount to standardize and the time to standardize are both important
> factors. **Attempting to standardize in areas where people are attempting
> to invent will impact the invention process.**

[premature standardization] is closely related to [premature generalization].
**If it's too soon to generalize, it's definitely too soon to standardize**.

</article>

<article><a name="COC"></a>[go to TOC](#TOC)

#### Prefer [Convention over configuration]

[Convention over configuration]: http://en.wikipedia.org/wiki/Convention_over_configuration
[configuration hell]: http://c2.com/cgi/wiki?ConfigurationHell
[too many parameters]: http://c2.com/cgi/wiki?TooManyParameters

Assume conventions to avoid the [configuration hell] and allow configuration
when need. That way the system gains simplicity without losing flexibility.

**The [rule of thumb]: A large number of configuration files with lots of
parameters is often an indicator of an unnecessarily complex application
design**. The same applies to functions with [too many parameters].

</article>

</section>

* * *

<section><a name="OOD"></a>[go to TOC](#TOC)

## Follow the principles of OOD

These principles expose the dependency management aspects of Object Oriented
Design. Poor dependency management leads to code that is hard to change,
fragile, and non-reusable. When dependencies are well managed, the code
remains flexible, robust, and reusable. So dependency management, and
therefore these principles, are at the foudation of the -ilities
that software developers desire.

The concept of **object** will be used to refer to *a variable, function, or
data structure*. Generally speaking, a *software entity*.

The concept of **builder** will be used to refer to *an extensible object for
creating objects*, in contrast to the historically used *class* concept which
assumes every language implements classes by itself. Alternatively, the
*class* concept  may be used as it is the de-facto standard, but apply it as
being semantically equivalent to **builder**.

<article><a name="SOLID"></a>[go to TOC](#TOC)

### _SOLID_: The five principles of objects design

These principles govern the *micro-structure* of object-oriented
applications. That's the structure of software entities, or objects.

<article><a name="sOLID"></a>[go to TOC](#TOC)

#### _S_: The single responsibility principle

> ~~A class~~ Objects should have one, and only one, reason to change.
>
> *Robert Cecil Martin aka [uncle Bob]*, on [this article](https://docs.google.com/open?id=0ByOwmqah_nuGNHEtcU5OekdDMkk)

Even the *[xtreme experts]* [questioned this principle], but the conclusion
is: if it's [applied correctly], it produces *less coupled* objects.

**The following statement can be used as a [rule of thumb]:**

> An object statement of responsibility (a 25-word or less statement)
> shouldn't have many 'and's and almost no 'or's.

[uncle Bob]: https://github.com/laconbass/iai/wiki/credits
[questioned this principle]: http://c2.com/cgi/wiki?MinimumNumberOfClassesAndMethods
[xtreme experts]: http://c2.com/cgi/wiki?WelcomeVisitors
[applied correctly]: http://www.wirfs-brock.com/PDFs/PrinciplesInPractice.pdf

</article>

<article><a name="SoLID"></a>[go to TOC](#TOC)

#### _O_: The open-closed principle

> Software entities should be open for extension, but closed for
> modification.
>
> *Robert Cecil Martin aka [uncle Bob]*, on [this article](https://docs.google.com/file/d/0BwhCYaYDn8EgN2M5MTkwM2EtNWFkZC00ZTI3LWFjZTUtNTFhZGZiYmUzODc1/edit?hl=en)

or

> Extending an object ~~a class~~ shouldn’t require modifying that object
> ~~class~~.
>
> *[Rebecca J. Wirfs-Brock], [Principles in Practice] - (2009)*

**The [rule of thumb] to detect violations of this principle**:

> When a single change to a program results in a cascade of changes to
> dependent modules.

When that happens, that program exhibits the undesirable attributes that
we have come to associate with “bad” design. The program becomes fragile,
rigid, unpredictable and unreusable.

Note that 100% closure is not attainable, closure must be strategic.

</article>

<article><a name="SOlID"></a>[go to TOC](#TOC)

#### _L_: The Liskov substitution principle

> What is wanted here is something like the following substitution property:
> If for each object o<sub>1</sub> of type S there is an object o<sub>2</sub>
> of type T such that for all programs P deﬁned in terms of T, the behavior
> of P is unchanged when o<sub>1</sub> is substituted for o<sub>2</sub> then
> S is a subtype of T.
>
> [Barbara Liskov], “Data Abstraction and Hierarchy”,
> SIGPLAN Notices, 23-5 (May 1988).

[Barbara Liskov]: http://en.wikipedia.org/wiki/Barbara_Liskov

Simplification by [uncle Bob] for better understanding and applying the
principle in practice (from [this article](https://docs.google.com/file/d/0BwhCYaYDn8EgNzAzZjA5ZmItNjU3NS00MzQ5LTkwYjMtMDJhNDU5ZTM0MTlh/edit?hl=en)):

> Functions that use pointer or references to base ~~classes~~ objects must
> be able to use objects derived from those base objects ~~classes~~
> without knowing it.

_This principle will be difficult to apply until it has a [rule of thumb]._

</article>

<article><a name="SOLiD"></a>

#### _I_: The interface segregation principle

> Clients should not be forced to depend upon interfaces that they do not
> use.
>
> *Robert Cecil Martin aka [uncle Bob]*, on [this article](https://docs.google.com/file/d/0BwhCYaYDn8EgOTViYjJhYzMtMzYxMC00MzFjLWJjMzYtOGJiMDc5N2JkYmJi/edit?hl=en)

That's, objects should not inherit properties that will never been used.

_This principle will be difficult to apply until it has a [rule of thumb]._

</article>

<article><a name="SOLId"></a>[go to TOC](#TOC)

#### _D_: The dependency inversion principle

> A. High level modules should not depend upon low level modules. Both
> should depend upon abstractions.
>
> B. Abstractions should not depend upon details. Details should depend upon
> abstractions.
>
> *Robert Cecil Martin aka [uncle Bob]*, on [this article](https://docs.google.com/file/d/0BwhCYaYDn8EgMjdlMWIzNGUtZTQ0NC00ZjQ5LTkwYzQtZjRhMDRlNTQ3ZGMz/edit?hl=en)

The open-closed principle and the liskov substitution principle have some
structural implications that may lead to a [dependency hell].
This principle is a powerfull tool to avoid software entities having one or
all of the following traits, that are symptoms of *[dependency hell]* (thus
a bad design):

  1. It is hard to change because every change affects too many other parts
     of the system. (Rigidity)
  2. When a change is made, unexpected parts of the system break. (Fragility)
  3. It is hard to reuse in another application because it cannot be
     disentangled from the current application. (Inmobility)

[dependency hell]: http://en.wikipedia.org/wiki/Dependency_hell

_This principle will be difficult to apply until it has a [rule of thumb]._

</article>

</article>

<article><a name="OOD-pack"></a>[go to TOC](#TOC)

### The six principles about package design

These principles govern the *macro structure* of **large** object-oriented
applications. That's, the structure of packages that will be released
independently.

<section><a name="pack-cohesion"></a>[go to TOC](#TOC)

#### About package cohesion

This principles tell us what to put inside packages.

<article><a name="pack-RREP"></a>[go to TOC](#TOC)

##### The Reuse/Release Equivalency Principle

> The granule of reuse is the granule of release. Only components that are
> released through a tracking system can be effectively reused. This granule
> is the package.
>
> *Robert Cecil Martin aka [uncle Bob], [Granularity]*

[Granularity]: https://docs.google.com/file/d/0BwhCYaYDn8EgOGM2ZGFhNmYtNmE4ZS00OGY5LWFkZTYtMjE0ZGNjODQ0MjEx/edit?hl=en

That's, code that is not released independently, can't be reused.
To reuse packages, only a link with their tracking system is need, thus
allowing us to choose when to upgrade to a new release if there is any.

_This principle will be difficult to apply until it has a [rule of thumb]._

</article>

<article><a name="pack-CCP"></a>[go to TOC](#TOC)

##### The Common Closure Principle

> The objects in a package should be closed together against the same kinds
> of changes. A change that affects a package affects all the objects in
> that package.
>
> *Robert Cecil Martin aka [uncle Bob], [Granularity]*

More important that reusability, is maintainability. If the code of an
application must change, we would rather see the changes focused into a
single package rather than have to dig through a whole bunch of packages
and change them all.

This principle amplifies the open-closed principle by grouping together
objects which cannot be closed against certain types of changes.

Designs should attempt to gather together in one place all the objects that
are likely to change for the same reasons. That way, when a change in
requirements comes along, that change has a good chance of being restricted
to a minimal number of packages.

_This principle will be difficult to apply until it has a [rule of thumb]._

</article>

<article><a name="pack-CRP"></a>[go to TOC](#TOC)

##### The Common Reuse Principle

> The objects in a package are reused together. If you reuse one of the
> objects in a package, you reuse them all.
>
> *Robert Cecil Martin aka [uncle Bob], [Granularity]*

This principle helps us to decide which objects should be placed into a
package. It's ideal that when a package depends upon another, depends upon
every object in the latter. Otherwise the former will be redistributing
more than is necessary, thus unnecessarily wasting resources.

_This principle will be difficult to apply until it has a [rule of thumb]._

</article>

</section>

<section><a name="loose-coupling"></a>[go to TOC](#TOC)

#### About loose coupling

This principles refer to the couplings between packages, and provide metrics
that evaluate the package structure of a system to determine its quality.

<article><a name="DAG"></a>[go to TOC](#TOC)

##### The Acyclic Dependencies Principle

> The dependency structure between packages must be a Directed Acyclic Graph
> ([DAG]). That is, there must be no cycles in the dependency structure.
>
> *Robert Cecil Martin aka [uncle Bob], [Granularity]*

[DAG]: http://en.wikipedia.org/wiki/Directed_acyclic_graph

That's, the overall package structure must be formed by a collection of
vertices (packages) and directed edges (relations between packages), each
edge connecting one vertex to another, such that there is no way to start
at some vertex *v* and follow a sequence of edges that eventually loops
back to *v* again. Such cycles make it very difficult to isolate modules
thus unit testing and releasing become very difficult and error prone.

**The [rule of thumb]: When a cycle is found, it must be broken.** This can be
accomplished by applying the dependency inversion principle or by adding
another package *in the middle*.

</article>

<article><a name="stability"></a>[go to TOC](#TOC)

##### The Stable Dependencies Principle

> The dependencies between packages in a design should be in the direction
> of the stability of the packages. A package should only depend upon
> packages that are more stable that it is.
>
> *Robert Cecil Martin aka [uncle Bob], [Stability]*

[Stability]: https://docs.google.com/file/d/0BwhCYaYDn8EgZjI3OTU4ZTAtYmM4Mi00MWMyLTgxN2YtMzk5YTY1NTViNTBh/edit?hl=en

Designs cannot be completely static. Some volatility is neccessary if the
design is to be maintained. Conforming to the Common Closure Principle,
packages are sensitive to certain kinds of changes. That's, they are
designed to be volatile, expecting them to change.

Conforming to this principle, we must ensure that modules that are designed
to be stable (harder to change) do not depend upon by modules that are
less stable (easyer to change) than they are. Otherwise, the *instable*
packages will be difficult to change in practice.

**Measuring the _positional stability_ of a package**

- *`Ca`* - Afferent Couplings: The number of objects outside the package that
  depend upon objects within the package.
- *`Ce`* - Efferent Couplings: The number of objects inside the package that
  depend upon objects outside this package.
- *`I`* - Instability: *I = (Ce / (Ca+Ce))* This metric has the range *[0,1]*.

The `Ca` and `Ce` metrics are calculated by counting the number of objects
*outside* the package in question that have dependencies with the objects
*inside* the package in question.

- When a package has *I=1* it's maximally instable, so it is *irresponsible
  and dependent*.
- When a package has *I=0* it's maximally stable, so it is *responsible and
independent*.

**The [rule of thumb]: A package *X* should depend on package *Y* only if
*X<sub>I</sub> > Y<sub>I</sub>*.**

</article>

<article><a name="abstractness"></a>[go to TOC](#TOC)

##### The Stable Abstractions Principle

> Packages that are maximally stable should be maximally abstract. Instable
> packages should be concrete. The abstraction of a package should be in
> proportion to its stability.
>
> *Robert Cecil Martin aka [uncle Bob], [Stability]*

This principle sets up a relationship between stability and abstractness.
A stable package should also be abstract so that its stability does not
prevent it from being extended, but prevents it from being modified.

That's why **high-level implementations should never be placed into
maximally stable packages** ( _I=0_ ), because they are not flexible enough
to withstand changes on the design if they are needed.

**The [rule of thumb]: Measure the _abstractness_ of a package**.

  _A = abstractObjects / totalObjects_

Note that **an abstract object is any object that has at least one pure
virtual function**.

As stated by [uncle Bob]:

> This is not a perfect metric. It presumes that a ~~class~~ with 20 concrete
> functions and one pure virtual function should be counted the same as a
> ~~class~~ with nothing but pure virtual functions. However, I have found no
> good way to characterize the abstractness of a class based upon a ratio of
> virtual to non-virtual functions. Also, the fact that a single pure virtual
> function exists is very significant. Imperfect though is, I have had good
> results with this metric.

Refer to its paper *[Stability]* for the concept of *Main Sequence*, the
relationship between istability (`I`) and abstractness (`A`).

</article>

</section>

</section>

* * *


