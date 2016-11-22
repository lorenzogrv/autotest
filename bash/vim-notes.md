##
# Use `vimdiff` as `git mergetool`
# > see http://www.rosipov.com/blog/use-vimdiff-as-git-mergetool/
git config --global merge.tool vimdiff
git config --global merge.conflictstyle diff3
git config --global mergetool.prompt false
