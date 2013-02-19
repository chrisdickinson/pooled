var test = require('tape')
  , pool = require('./index')

test('test pooling of simple constructor', function(assert) {
  function Point(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }

  Point = pool(Point)

  var p = Point.attain(1, 2, 3)

  assert.equal(p.x, 1)
  assert.equal(p.y, 2)
  assert.equal(p.z, 3)

  assert.equal(Point.pooled(), 0)
  assert.equal(Point.extant(), 1)

  var p2 = Point.attain(4, 5, 6)
    
  assert.equal(Point.pooled(), 0)
  assert.equal(Point.extant(), 2)

  p.release()

  assert.equal(Point.pooled(), 1)
  assert.equal(Point.extant(), 1)

  var p3 = Point.attain(7, 8, 9)

  assert.equal(p.x, 7)
  assert.equal(p.y, 8)
  assert.equal(p.z, 9)

  assert.ok(p === p3, 'p should be exactly p3')
  assert.equal(Point.pooled(), 0)
  assert.equal(Point.extant(), 2)

  p.w = 21

  assert.strictEqual(p.w, undefined)

  assert.end()
})

test('test direct pooling of typed arrays fails', function(assert) {
  var Int32 = pool(Int32Array)

  try {
    var i32 = Int32.attain(128)
    assert.fail('should throw')
  } catch(e) {
    assert.ok(true, 'threw error')
  }
  assert.end()
})

test('release calls onrelease', function(assert) {
  function Point(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }

  var called = false

  Point.prototype.onrelease = function() {
    called = true
  }

  Point = pool(Point)
  var p = Point.attain(12, 12, 12)
  p.release()
  assert.ok(called, 'onrelease was called')
  assert.end()
})

test('test preallocating works and does not call onrelease', function(assert) {
  var called = false
    , expect1 = Math.random()
    , expect2 = Math.random()
    , times = 0
    , num = ((Math.random() * 10)|0) + 1
  function Simple(a1, a2) {
    ++times
    assert.equal(a1, expect1)
    assert.equal(a2, expect2)
  }

  Simple.prototype.onrelease = function() {
    called = true
  }

  Simple = pool(Simple)
  Simple.allocate(num, expect1, expect2)

  assert.ok(!called, 'should not call onrelease during prealloc')
  assert.equal(times, num)
  assert.equal(Simple.pooled(), num)
  assert.end()
})


