module.exports = pooled

function pooled(cons, should_seal) {
  should_seal = !!should_seal

  var pool = []
    , len = cons.length
    , newcons = gennewcons(len, should_seal)(cons)
    , preallocating = false
    , total = 0
    , retcons

  retcons = function() {
    return retcons.attain.apply(null, arguments) 
  }

  for(var key in cons) {
    retcons[key] = cons[key]
  }

  retcons.attain = attain
  retcons.pooled = pooled 
  retcons.extant = extant
  retcons.allocate = allocate
  cons.prototype.release = release

  return retcons

  function attain() {
    var out
    ++total
    if(pool.length) {
      out = pool.shift()
      cons.apply(out, arguments)
    } else {
      out = newcons.apply(null, arguments)
    }
    return out
  }

  function extant() { 
    return total
  }

  function release() {
    --total
    if(!preallocating && this.onrelease) {
      this.onrelease()
    }
    pool[pool.length] = this
  }

  function pooled() {
    return pool.length
  }

  function allocate(num) {
    var args = [].slice.call(arguments, 1)
      , out = []
    preallocating = true
    for(var i = 0; i < num; ++i) {
      out[out.length] = retcons.apply(null, args)
    }
    for(var i = 0; i < num; ++i) {
      out[i].release()
    }
    preallocating = false
    return pool.length
  }
}

function gennewcons(len, should_seal) {
  var argnames = []

  for(var i = 0; i < len; ++i) {
    argnames[argnames.length] = '_'+i
  }

  return Function('cons', 'return function('+argnames+') {' +
                          '  var out = new cons('+argnames+');' +
                          (should_seal ? '  Object.seal(out);' : '') +
                          '  return out;' +
                          '}')
}
