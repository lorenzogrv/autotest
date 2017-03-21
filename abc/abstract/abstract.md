# The *abstract* feature: procedure standarization

This is the strategy to work with the *unknown*. The aproach consists on
letting the *unknown* be *known*, through the use of standarization
documents named *abstract* (singular) or *abstracts* (plural).

## Value

Standarizing procedures to accomplish tasks eases automating them, cutting
down the time spent to complete them. By continually improving the method
trough retrospective analysis, each time the procedure is used it becomes even
better to reach the target.

## Definition

*abstract* that manages *abstracts*' life cycle, describing *abstract* as a
document that stablishes a work flow to perform a concrete task.

## Procedure

1. Justify the need of a new *abstract*
2. Write the *abstract* and adopt it as standard
3. Apply the *abstract* and analize obtained results
4. Evolve the *abstract*

### Phase 1: Argument the need of a new *abstract*

The fact starting an *abstract*'s life-cycle is the need to automate a
procedure to perform a concrete task that can't be accomplished with
an existant *abstract*.

### Phase 2: Write the *abstract* and adopt it as standard

The document must meet the requeriments specified on this *abstract* Annex I.
Once written, it is adopted as standard saving it at `abc/abstract`.

> TODO: it's correct to specify filesystem paths at *abstracts*?

### Phase 3: Apply the *abstract* and analize obtained results

Once adopted as standard, it must be used to perform the task it was conceived
for. Each time the procedure is completed, obtained result must be analyzed by
determining it's successfullness. This phase repeats until a result is not
successfull, case which aborts the process and moves to phase 4.

### Phase 4: Evolve the *abstract*

Repeat procedure from phase 2 onwards to include the details the *abstract* is
missing, so the failed result will not repeat. To confirm, apply the phase 3
to the failed result case.

- - -

# Annex I: Definition of a valid *abstract*

An abstract contains:

  1. Title
  2. Intro
  3. Value
  4. Procedure
    1. Summary
    2. Details
  5. Annexes

## Regarding the file

- It must be a regular file which the current user can read an write.
- The filename must be a lowercased word followed by the .md extension.

## Regarding file content

- Each line must have 80 characters or less
- Page 1 line length must not excede 2 screens (1 screen = 25 lines)
- Page 2 and onwards (annexes) line length must not excede 1 screen for each
- The document must contain the following things, each one ended by empty line
  - First line must start with "# The $codename feature: " (codename=filename)
  - First line must end with the **title**, describing the task it performs
  - A paragraph being the **intro**
  - The **value** section title (literally "## Value")
  - A paragraph describing the value added to the development procedure
  - Optionally, a one-line quote ("> ...") with numeric statistics
  - The **procedure** title (literally "## Procedure")
  - An ordered enumeration of the procedure phases
  - For each procedure phase:
    - A line starting with "### Phase $n: ", ending with the text at enumeration
    - A paragraph describing the actions to perform at this phase.
  - For each annex:
    - A line being a spliter (literally "- - -")
    - A line staring with "# Annex $n: ", ending with the annex title
    - The annex content
