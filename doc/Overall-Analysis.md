# Overall Analysis

[goals]: https://github.com/laconbass/iai/wiki/Goals
[automate]: http://en.wikipedia.org/wiki/Automate
[convention over configuration]: https://github.com/laconbass/iai/wiki/Design-Principles#33-convention-over-configuration
[methodology driven]: https://github.com/laconbass/iai/wiki/Goals#methodology-driven

Analyzing the [goals] it's clear that *iai* will be a complex system:

> iai is a ~~general purpose solution~~ program to automate the software development
> process of web based applications, dramatically reducing the time needed
> to succesfully deliver ready-to-use features.

To accomplish this ambicious goal, we need to thoroughly analyze it.

* * *

One important concept on this description is **[automate]**:

> the use of various control systems for operating equipment with minimal or reduced human intervention

There are two types of automation:

1. **feedback control**: taking measurements using a sensor and making calculated adjustments to keep the measures within a set range.
2. **sequence control**: a programed sequence of discrete operations that will perform different actions depending on various system states.

* * *

> Let **methodology** be an alias for *the software development process of web based applications*.

We can't automate something unknown, so we have 2 options:

1. ask the user what methodology wants to use (any could be used according to [methodology driven]); or
2. default to the convention (we must have a default according to [convention over configuration]).

So the user should be able to extend the program with her own methodology through configuration. For user experience, the program should provide a way to interactively define the methodology.

* * *

According to the [methodology] goal we must support agile thoughts, so

> Let **methodology** be a sequence which we iterate over continuously

> Let the default methodology be the following iterable sequence:
>
> 1. Define the features to be implemented
> 2. Prioritize the features to be implemented
> 3. Determine the due date for the next feature??
> 4. Select a feature to be implemented
> 5. Implement the feature







First we must analyze the software development process itself. . Also, acording to the goals the behaviour of iai should be like the development methodology itself.
.


quickly create applications by generating them automatically by "parsing" its specification.

At the very first we need some conventions to effectively automate

1. A set of conventions: Some rules the source code should meetis generated.
1. A set of tools to automate processes:
  1. A code generator: A subprogram that writes source code based on its input. Let's call it *vim*
  1. An analyst: A subprogram that parses the source code and tells us what actually does
1. A library: The source code that aids writting source code.
1. A tool: The source code that automates processes

This three main objectives should be addressed independently. Think on the tool wanting to check that the library complies with the convention.

> think

> working on

## The iai convention
