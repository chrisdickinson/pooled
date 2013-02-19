# pooled

turn a javascript constructor into a pooled resource that can be
`attain`'d and `release`'d (to reduce garbage generation by reusing
objects; useful in games where you want to avoid GC at all costs).

```javascript

function Point(x, y, z) {
  this.x = x
  this.y = y
  this.z = z
}

Point.prototype.onrelease = function() {
  console.log('released')
}

Point = pooled(Point)

var p = Point(0, 0, 0)
p.release() // -> "released"
console.log(Point.pooled()) // -> 1
var p2 = Point(12, 12, 12)
console.log(Point.pooled()) // -> 0
console.log(Point.extant()) // -> 1
console.log(p2 === p)       // true 

Point.allocate(100, 12, 21, 1)  // preallocate 100 Point objects
                                // with arguments

```

## API

#### newcons = pooled(cons[, shouldSeal=false])

Create a pooled constructor from an existing constructor.

If `shouldSeal` is true, resultant objects will be `Object.seal`'d before being returned.

#### newcons.attain(arg1, arg2, arg3) -> instance
#### newcons(arg1, arg2, arg3...) -> instance

Forward the arguments to the original constructor and create a new instance.

#### newcons.extant() -> number

Get the number of currently held instances of `newcons`.

#### newcons.pooled() -> number

Get the number of currently pooled (released) instances of `newcons`.

#### newcons.allocate(number[, default, arguments, go, here]) -> number

Allocate `number` new `newcons` instances into the pool. Forward the provided arguments to them.

Returns the number of currently pooled objects. 

#### instance.release()

Releases this instance. You should get rid of the reference to it in your code, 
as some other code might reuse this object at later point.

If there is an `onrelease` method on the object, it'll get called.

## License

MIT
