
# Vim hacking reference

## Help commands

- Quick ref
  - `vim --help | less`
- General ref
  - vim man page: `man vim`
  - vim user manual TOC: `vim --cmd "help usr_toc.txt| only"`
- Specific, useful things
  - Shell in a window: `vim --cmd "help shell-window| only"`
  - Folding: `vim --cmd "help usr_28.txt| only"`

## Vim keys - "in a broad sense of the word"
- `"+p` - paste from desktop clipboard - http://vim.wikia.com/wiki/Accessing_the_system_clipboard

## How to use `vimdiff` as `git mergetool`

> see http://www.rosipov.com/blog/use-vimdiff-as-git-mergetool/

```
git config --global merge.tool vimdiff
git config --global merge.conflictstyle diff3
git config --global mergetool.prompt false
```
