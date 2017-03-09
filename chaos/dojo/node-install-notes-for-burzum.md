# Problem description

the wsproxy service will hang while running `start` **when nodejs is not installed**

## Steps to reproduce:

1. clean everything with:
```
rm -rf /opt/smaug
cd $_SMAUG_REPO
make clean
git clean -f && git clean -df
```
2. Install the whole thing following instructions at `doc/webclient.txt`
3. Follow the instructions at `doc/webclient.txt` to start the services. Observe at `./smaugd-wsproxy start` the init.d script keeps starting forever until `^C` **when nodejs isn't installed**

## How to fix

It's simple: **install nodejs**. Two options provided below:

### Option 1: use your system's package manager

i.e, debian based systems: `apt-get install nodejs`. **I don't recommend this way**, but if you don't develop anything for node (or maybe you need only node to make your _smaug_ installation work) this is by far the simplest alternative. You've been warned.

### Option 2: use [nvm](https://github.com/creationix/nvm) (*node version manager*)

The *node version manager* is a fairly common tool to manage nodejs installs, even at production systems. **I recommend this way** but note it requires mangling with it's per-user installation basis. This happens due to the current aproach to manage _smaug_ services: they are started as root but run as `smaug` user.

It's not recommended to [install nvm as root](https://github.com/xtuple/nvm), the following should be executed as your normal user:

```
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
# close & open terminal, or follow nvm's install script outputed instructions, something like:
export NVM_DIR="/home/$USER/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
# Verify nvm installation with:
command -v nvm
# now install the nodejs version
nvm install 4.6.1 # install will also select 4.6.1 as "current"
# optionally you can alias the nodejs version
nvm alias default 4.6.1
```
It's not documented but @burzumishi told me he's ussing `v4.6.1` (last debian published version at the moment). See also [nvm install script](https://github.com/creationix/nvm#install-script) and [nvm usage](https://github.com/creationix/nvm#usage) for details about nvm.

An extra step is required to link the current nvm-managed node system wide because nvm is designed to work with per-user basis. As stated above I don't recommend [system-wide installs](http://www.marcominetti.net/personal/blog/2015/09/install-system-wide-node-js-with-nvm-the-painless-way), but for the ongoing seems better a system-wide link than setting-up nvm for the smaug user.

```
# hack from http://stackoverflow.com/a/29903645/1894803
n=$(which node);n=${n%/bin/node}; chmod -R 755 $n/bin/*; sudo cp -r $n/{bin,lib,share} /usr/local
```

Aditional notes:
- A better aproach is [installing nvm for all users](http://stackoverflow.com/questions/11542846/nvm-node-js-recommended-install-for-all-users), but until some things are decided by burzumishi it's senseless.
- A [.nvmrc file](https://github.com/creationix/nvm#nvmrc) - at project's root - could manage the node version that should be used, but again this applies at future. This allows selecting a node version on a per-project basis, even with automated procedures (i.e. with [`avn`](https://github.com/wbyoung/avn)). When working at multiple projects with nodejs and dealing with the dependency management hell caused by node's fast growth, I personally like "making the life easier".

> chuchosnocu
