# iai conventions for `.md` docs

A bit of HTML is convenient to provide basic navigation within the own
document. Specially on documentation that is not read on its source
code form.

This navigation is provided through HTML anchors pointing to tag ids,
and markdown links. **View this document in source code form as example**

> Anchors must be above titles:

<article><a name="TOC"></a>

## Table of contents

> A TOC is always wellcome for in-document navigation :)

1. [Code for navigation](#doc-nav)
  - [Use HTML Anchors with 'name' or 'id'?](#name-vs-id)
1. [Cites and TODOs](#TODOs)

</article>

> Use rules to split sections:

* * *

> On big documents, articles too

<article><a name="doc-nav"></a>[go to TOC](#TOC)

## Use HTML for anchors and markdown for links

Use `article` tags for navigation, as they will be probably
rendered on screen. It's better to inline it with the HTML
code so document does not seem ugly on plain text editors:

> The nice line to insert in-browser navigation:

`<article id="link-reference">[go to TOC](#TOC)`

> As I am currently only rendering on github, **I should use**:

`<article><a name="link-reference"></a>[go to TOC](#TOC)`

> **remember to close article tags**:

`</article>`

> Articles may omit the "go to TOC" link it it becomes verbose.
> Be generous with "#" for 3rd level and onwards headings.

<article><a name="name-vs-id"></a>

#### Use HTML Anchors with 'name' or 'id'?

[QA on SO]: (http://stackoverflow.com/questions/484719/html-anchors-with-name-or-id)
[HTML 5 draft]: http://www.w3.org/html/wg/drafts/html/master/browsers.html#scroll-to-fragid)

> After reading on this [QA on SO] and according to [HTML 5 draft] 
> **the latter seems better**, as it renders nice with the HTML 5 output
> generated after its conversion to HTML by most parsers.
> _(L. @ January 2015 )_

</article>

> remember to use rules to split sections:

* * *

<article><a name="TODOs">[go to TOC](#TOC)

## Use a semantic markup and provide reference

> Reference should appear below the title (view the source code
> to understand how reference links are provided).

[L.]: http://some.domain.reference/to/the/autor/source
[reference]: http:/does-not-exist.sure
[guru text]: ./Design-Principles#READ


Use literal cites mentioning the author source. On cites mentioning
sources that are expected to change, include a time reference.

> The source markup should be semantic, thus understandable by readers.
> _([L.] @ January 2015)_

**TODO**

- [ ] **This seems like [guru text], where is [reference]?**
- [ ] Decide if improve or not this section as it provides a nice
      example for **TODO lists** and multi-line tasks.
    - [ ] Even for sub-tasks.

</article>
