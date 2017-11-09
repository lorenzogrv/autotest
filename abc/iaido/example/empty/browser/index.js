
var iai = require('iai-core')

iai.bootstrap(window)

function terminalExample () {
  var XTerm = require('xterm')
  var terminal = new XTerm()
  console.log(terminal)
  terminal.open(document.getElementById('terminal'))
  terminal.write('Hello world')
}
