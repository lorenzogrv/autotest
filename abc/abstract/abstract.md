# How to standarize a procedure

This is the strategy to work with the *unknown*. The aproach consists on
letting the *unknown* be *known*, through the use of standarization
documents named *abstract* (singular) or *abstracts* (plural).

## Definition

*abstract* that manages *abstracts*' life cycle, describing:

- *abstract*: document stablishing a work flow to perform a *task*.
- *task*: An *abstract*'s title.

## Steps

1. Argument the need of a new *abstract*
2. Write the *abstract* and adopt it as standard
3. Apply the *abstract* and analize obtained results
4. Evolve the *abstract* when obtained unsuccessful results

- - -

# Annex 1: Argument the need of a new *abstract*

The fact starting an *abstract*'s life-cycle is the need to perform a
*task* being *unknown*.

## Definition

*abstract* to create *abstracts*, describing:

- *unknown*: *task* that can't be accomplished with an existant *abstract*.

## Steps

1. Identify an *unknown* task to be done
2. Determine the *abstract* codename
3. Create an empty file to contain the abstract
4. Apply step 2 of *abstract* codenamed **abstract**

- - -

# Annex 1.1: Identify an *unknown* task to be done

The strategy consists on researching the things to be done.

## Definition

*abstract* to search for the *unknown*.

## Steps

1. Recursively search the project directory to find the "todo" keyword in files
2. Generate the todo description using the `iai todo describe` command
3. When description matches an existant abstract codename, ignore that match
4. When not, determine if an existant abstract can perform that task
5. When not, procede to Annex 1.2. Else case, repeat from step 1.

- - -

# Annex 2: Write the *abstract* and adopt it as standard

The document must meet the requeriments specified on this *abstract* Annex 2.1.
Once written, it is adopted as standard when  commited to `abc/abstract`.

## Steps

1. Define the *Title*
2. Define the *Intro*
3. Define the *Steps*
5. Define *Annexes* as *abstracts* for each step

### Phase 3: Apply the *abstract* and analize obtained results

Once adopted as standard, it must be used to perform the task it was conceived
for. Each time the procedure is completed, obtained result must be analyzed by
determining it's successfullness. This phase repeats until a result is not
successfull, case which aborts the process and moves to phase 4.

1

### Phase 4: Evolve the *abstract*

Repeat procedure from phase 2 onwards to include the details the *abstract* is
missing, so the failed result will not repeat. To confirm, apply the phase 3
to the failed result case.

- - -

# Annex I: Definition of a valid *abstract*

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
  - Optionally, a one-line quote ("> Value {data}") with statistics
  - The **procedure** title (literally "## Procedure")
  - An ordered enumeration of the procedure phases
  - For each procedure phase:
    - A line starting with "### Phase $n: ", ending with the text at enumeration
    - A paragraph describing the actions to perform at this phase.
  - For each annex:
    - A line being a spliter (literally "- - -")
    - A line staring with "# Annex $n: ", ending with the annex title
    - The annex content
