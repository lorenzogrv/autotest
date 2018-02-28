const { View } = require('iai')

var terminal = module.exports = View.create('terminal')

terminal.display = function () {
  return View.display.call(this).done(function () {
    terminal.inh1 = document.querySelector('#stdin')
  })
}

terminal.stdout = function (str) {
  this.$.innerHTML = str + '\n' + this.$.innerHTML
  return this
}

terminal.keypress = function keypress (key) {
  if (key.length === 1) {
    this.inh1.append(key)
    return
  }
  switch (key) {
    case 'Space':
      this.inh1.innerHTML += ' '
      break
    case 'Backspace':
      this.inh1.innerHTML = this.inh1.innerHTML.slice(0, -1)
      break
    case 'Enter':
      this.emit('command', this.inh1.innerHTML)
      this.inh1.innerHTML = ''
      break
    default:
      this.log('unbound key: ' + key)
  }
}
