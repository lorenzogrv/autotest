# The life cycle

> The lifecycle document is about the workflow and the tools.
>
> @laconbass, February 2016

This document describes the development life cycle of *iai*. It also sets a
precedent of how *the applications iai produces* **could** be developed too.

[the decision procedure]: https://github.com/laconbass/iai/wiki/Decision-Procedure

> To know why things hereafter are as they are, see [the decision procedure].
>
> @laconbass, January 2016


## The infinite loop

> The iai tool is the tool to edit iai itself. That way the lifecycle is
> infinite. To do it successfully there must be some tools assemblied within
> iai itself as it is *nothing* at origins.
      
This document must explain the decisions taken to adopt a tool. It's important:

- What does the tool
- The role it plays on the workflow so *Why doing that is important?*
- How the tool can be integrated within iai
- How the use of the tool can be automated
- The methodology that standarizes its use effectively so *How to use it?*

> *tool*: a device or implement used to carry out a particular function.

## About documents and code

> *document*: a piece of written, printed, or electronic matter that provides
information or evidence or that serves as an official record.

> *code*: program instructions.


*What*-
Documents are an implement used to comunicate humans with humans.
Note humans can communicate with themselves through documents.
Code is an implement used by humans to command a machine.
Note a command *from-machine-to-machine* is sent, at origins, by an human.
Both concepts are tools. Tools to *comunicate*.

*Why*-
Use documents and code to comunicate humans and machines, conecting them.

> *Self-documented code* and *¿parsable documentation?*
can conect humans and machines indistinctly. Reaching that level is hard for the
former, and requires conventions for the other. Keep it simple. Use both
documents and code for the ongoing.

*How*-
To integrate that tools, use plain text files. Automate its use with existing
software that can effectively Create, Read, Update, and Destroy them.
Tiny programs to do even complex things with plain text files are easy to write.

There isn't a methodology that standarizes the use of documents and code because
it seems [too soon to standarize] that. Maybe in the future.

[too soon to standarize]: http://c2.com/cgi/wiki?PrematureStandardization

## About source control

> *source*: a place, person, or thing from which something can be obtained.

Documents are things from which knowledge can be obtained.
Code is a thing from which an executable can be optained.
Both concept are source. Source is a tool to store *knowledge*.

> *Source Control* can effectively store the evolution of the contents of plain
text files through time successfully.

*What*-



* * *

naming is an architecture thing!

Things being documents:

- Issues *(i.e. Issue [#1]: Define thoroughly the iai concept)*
- Manifestos *(i.e. [The Concept])*
- Reasonings *(i.e. [this document])*
- Methodologies *(i.e. [a source control methodology])*

[#1]: https://github.com/laconbass/iai/issues/1
[The Concept]: https://github.com/laconbass/iai/wiki/Concept
[this document]: https://github.com/laconbass/iai/wiki/Life-Cycle
[a source control methodology]: http://nvie.com/posts/a-successful-git-branching-model/

Things being code:
- A library
- A package
- A module
- ¿...?


---

### Stages

> Working with the unknown

Each *big task* is considered a **stage**: _a point, period, or step in a
process or development_. The *iai* development can jump from any *stage* to
another at any point (working with the unknown - needs explanation) so the
word "phase" is banned to avoid a sequential-like feel.

## Planning stage

### Design principles

The life cycle of *iai* began, after the idea, on its [design principles].
They are meant to be a strong foundation to build *iai* upon them.

The self-discussion can be followed on [#1], it will be a work in progress
until the 1.0.0 release.

[design principles]: https://github.com/laconbass/iai/wiki/Design-Principles
[#1]: https://github.com/laconbass/iai/issues/1

### Goals aka *requeriments*

After the definition of its [design principles], the life cycle of *iai*
continues on defining its [goals].

The self-discussion can be followed on [#2], it will be a work in progress
until the 1.0.0 release.

[goals]: https://github.com/laconbass/iai/wiki/Goals
[#2]: https://github.com/laconbass/iai/issues/2

### Overall Analysis

Currently working on this. See the [overall analysis] document and the self-discussion on [#4].

[overall analysis]: https://github.com/laconbass/iai/wiki/Overall-Analysis
[#4]: https://github.com/laconbass/iai/issues/4

### The choice of the technologies

[follow an order]: http://en.wikipedia.org/wiki/Best_Coding_Practices
[not really correct]: https://github.com/laconbass/iai/issues/7 

"Not started yet". Well, this is [not really correct], but let's [follow an order] and *don't put the cart before the horse*.

### Definition of the code conventions and style guide

There must be conventions on how documents and source code are written.

- [HTML 5 + markdown](https://github.com/laconbass/iai/wiki/HTML5-markdown)


## Architecture stage

[Naming is hard]: http://blog.codinghorror.com/i-shall-call-it-somethingmanager/
[naming]: http://martinfowler.com/bliki/TwoHardThings.html

> [Naming is hard]. Naming is an architecture thing.
>
> @laconbass, February 2016

When the topic has to do with [naming] and structure, it's likely architecting.

- System architecture
- Information architecture

[Conceptual Integrity](http://c2.com/cgi/wiki?ConceptualIntegrity)
Seems important

## Design stage

Not started yet.

- Graphics design (art)
- UX design (interface)

## Implementation stage

Not started yet. 
This will be done incrementally, following agile practices.

> Calling it "implementation" seems to vague. 

- - - 
