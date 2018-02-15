
module.exports = View

View.prototype = View
View.prototype.constructor = View

function View (id) {
  if (!id) {
    throw new Error('views must have an id')
  }
  // YAGNI!!
  if (View.cache[id]) {
    return View.cache[id]
  }

  var instance = Object.create(View)
  View.cache[id] = instance

  instance.id = id // TODO this data descriptor should be non-writable

  return instance
}

View.cache = Object.create(null) // TODO this should be a set?

View.toString = function () {
  // TODO this.id may be undefined
  return '<div id="' + this.id + '" class="view"></div>'
}

View.display = function () {
  if (this.$) {
    // TODO if i have a DOM element, it's already appended
    // HERE GOES "HIDE ALL VIEWS, SHOW THIS VIEW"
    alert('not implemented')
    return this
  }
  // no DOM element, let's append on body (with care)
  if (document.querySelector('#' + this.id) !== null) {
    alert('document id "' + this.id + '" already exists')
    throw new ReferenceError("can't duplicate id")
  }
  document.body.innerHTML += this // toString outputs HTML
  this.$ = document.querySelector('#' + this.id)
  return this
}
