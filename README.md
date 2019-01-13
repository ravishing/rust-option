# rust-option
[![Build Status](https://travis-ci.org/exoticknight/rust-option.svg?branch=master)](https://travis-ci.org/exoticknight/rust-option)
[![codecov](https://codecov.io/gh/exoticknight/rust-option/branch/master/graph/badge.svg)](https://codecov.io/gh/exoticknight/rust-option)
![license](https://img.shields.io/npm/l/rust-option.svg)

brings Option and Result in Rust to Javascript

## Install

```bash
npm i -S rust-option
```

## Usage

Nearly all methods are similar to the [Rust Documentation][option]

> this lib will not brings all methods from Rust's Option and Result, see [Note](#Note)

```javascript
import {
  Some,
  None,
  Ok,
  Err,

  match,
} from 'rust-option'

let x = Some(2)
let y = None
let z = Ok(1)
let w = Err('error')

// Note: matchs are exhaustive
match(x, [
  [Some(2), () => console.log('match')],
  [None, () => console.log('not match None')],
  // the 'default' match
  () => console.log('not match default'),
])
// output 'match'
```

[option]: https://doc.rust-lang.org/std/option/enum.Option.html

## Test

```bash
npm test
```

## The `match` function

`match` function provides match syntax similar to Rust, but in JavaScript way.

```javascript
import {
  Some,
  None,
  Ok,
  Err,

  match,
} from 'rust-option'

let x = Some(2)
let y = None
let z = Ok(1)
let w = Err('error')
```

equal(===) considered to be match

```javascript
match(1, [
  [1, () => conso.log('match')],
  () => console.log('not match ')
])
```

handle type match

```javascript
match(1, [
  [Number, (x) => conso.log(x)],
  () => console.log('not match ')
])
```

more matches

**value**|**match**
:-----:|:-----:
1|1, Number
NaN|NaN, Number
'yeah'|'yeah', 'ea', String
false|false, Boolean
function f(){}|Function
new Date('2000-01-01')|new Date('2000-01-01'), Date
[1,2,4]|Array
/foo/|RegExp
new Set|Set
new Map|Map
new WeakMap|WeakMap
new WeakSet|WeakSet
Symbol.iterator|Symbol
arguments|Arguments
new Error|Error
{a:1, b:2 }|object, {a: 1}, {a: Number}

normal match

```javascript
match(x, [
  [Some(2), () => console.log('match')],
  [None, () => console.log('not match None')],
  // the 'default' match
  () => console.log('not match default'),
])
```

non-exhaustive match throws Error

```javascript
// this will throws 'non-exhaustive patterns' Error
match(x, [
  [None, () => console.log('not match None')],
])
```

default branch can get the matchee

```javascript
match(x, [
  m => console.log('default match get Some(2) as parameter')
])
```

handle nested match
```javascript
let z = Ok(x)
let w = Err('error')

match(z, [
  [Ok(Some(2)), () => console.log('match')],
  [w, () => console.log('not match Err')],
  // the 'default' match
  () => console.log('not match default'),
])
```

## deepEqual

deepEqual in Javascript is not a piece of cake.

deepEqual in this lib is provided by [lodash.isequal][lodash.isequal].

```javascript
import {
  Some
} from 'rust-option'

let ox = Some({foo: 1})
let oy = Some({foo: 1})
ox.equal(oy)  // false
ox.equal(oy, true)  // true
```

[lodash.isequal]: https://www.npmjs.com/package/lodash.isequal

<a name="#Note"></a>
## Note

TODO

## implement for Option

- [x] isSome
- [x] isNone
- [x] expect
- [x] unwrap
- [x] unwrapOr
- [x] unwrapOrElse
- [x] map
- [x] mapOr
- [x] mapOrElse
- [x] okOr
- [x] okOrElse
- [x] and
- [x] andThen
- [x] filter
- [x] or
- [x] orElse
- [x] xor
- [x] transpose

## not implement for Option

```text
as_ref
as_mut
as_pin_ref
as_pin_mut
iter
iter_mut
get_or_insert
get_or_insert_with
take
replace
cloned
unwrap_or_default
deref
```

## implement for Result

- [x] isOk
- [x] isErr
- [x] ok
- [x] err
- [x] map
- [x] mapOrElse
- [x] mapErr
- [x] and
- [x] andThen
- [x] or
- [x] orElse
- [x] unwrapOr
- [x] unwrapOrElse
- [x] unwrap
- [x] expect
- [x] unwrapErr
- [x] expectErr
- [x] transpose

## not implement for Result

```text
as_ref
as_mut
iter
iter_mut
unwrap_or_default
deref_ok
deref_err
deref
```

## License

MIT