import test from 'tape'

import {
  Some,
  None,
  NoneError,

  Ok,
  Err,
} from '../src'

test('isSome / isNone', t => {
  let x = Some(2)
  t.true(x.isSome())

  x = None
  t.true(x.isNone())

  t.end()
})

test('expect', t => {
  let x = Some(1)
  t.equal(x.expect('the world is ending'), 1)

  x = None
  try {
    x.expect('the world is ending')
  } catch (error) {
    t.equal(error.message, 'the world is ending')
  }

  t.end()
})

test('unwrap / unwrapOr / unwrapOrElse', t => {
  let x = Some(1)
  t.equal(x.unwrap(), 1)

  x = None
  try {
    x.unwrap()
  } catch (error) {
    t.ok('should throw error')
  }

  t.equal(Some(1).unwrapOr(2), 1)
  t.equal(None.unwrapOr(1), 1)

  let k = 10
  t.equal(Some(4).unwrapOrElse(() => 2 * k), 4)
  t.equal(None.unwrapOrElse(() => 2 * k), 20)

  t.end()
})

test('map / mapOr / mapOrElse', t => {
  let someStr = Some('Hello, World!')
  t.true(someStr.map(s => s.length).equal(Some(13)))
  someStr = None
  t.true(someStr.map(s => s.length).equal(None))

  let x = Some('foo')
  t.equal(x.mapOr(42, v => v.length), 3)
  x = None
  t.equal(x.mapOr(42, v => v.length), 42)

  let k = 21
  let y = Some('foo')
  t.equal(y.mapOrElse(() => 2 * k, v => v.length), 3)
  y = None
  t.equal(y.mapOrElse(() => 2 * k, v => v.length), 42)

  t.end()
})

test('okOr / okOrElse', t => {
  let x = Some('foo')
  t.true(x.okOr(0).equal(Ok('foo')))
  x = None
  t.true(x.okOr(0).equal(Err(0)))

  let y = Some('foo')
  t.true(y.okOrElse(() => 0).equal(Ok('foo')))
  y = None
  t.true(y.okOrElse(() => 0).equal(Err(0)))

  t.end()
})

test('and / andThen', t => {
  let x = Some(2)
  let y = None
  t.true(x.and(y).equal(None))

  x = None
  y = Some('foo')
  t.true(x.and(y).equal(None))

  x = Some(2)
  y = Some('foo')
  t.true(x.and(y).equal(Some('foo')))

  x = None
  y = None
  t.true(x.and(y).equal(None))

  // andThen
  const sq = (x:number) => Some(x * x)
  const nope = (_:number) => None
  t.true(Some(2).andThen(sq).andThen(sq).equal(Some(16)))
  t.true(Some(2).andThen(sq).andThen(nope).equal(None))
  t.true(Some(2).andThen(nope).andThen(sq).equal(None))
  t.true(None.andThen(sq).andThen(sq).equal(None))

  t.end()
})

test('filter', t => {
  const is_even = (n:number):boolean => {
    return n % 2 == 0
  }

  t.true(None.filter(is_even).equal(None))
  t.true(Some(3).filter(is_even).equal(None))
  t.true(Some(4).filter(is_even).equal(Some(4)))

  t.end()
})

test('or / orElse', t => {
  let x = Some(2)
  let y = None
  t.true(x.or(y).equal(Some(2)))

  x = None
  y = Some(100)
  t.true(x.or(y).equal(Some(100)))

  x = Some(2)
  y = Some(100)
  t.true(x.or(y).equal(Some(2)))

  x = None
  y = None
  t.true(x.or(y).equal(None))

  // orElse
  const nobody = () => None
  const vikings = () => Some('vikings')

  t.true(Some('barbarians').orElse(vikings).equal(Some('barbarians')))
  t.true(None.orElse(vikings).equal(Some('vikings')))
  t.true(None.orElse(nobody).equal(None))

  t.end()
})

test('xor', t => {
  let x = Some(2)
  let y = None
  t.true(x.xor(y).equal(Some(2)))

  x = None
  y = Some(2)
  t.true(x.xor(y).equal(Some(2)))

  x = Some(2)
  y = Some(2)
  t.true(x.xor(y).equal(None))

  x = None
  y = None
  t.true(x.xor(y).equal(None))

  t.end()
})

test('equal / deepEqual', t => {
  let x = Some(2)
  let y = Some(2)
  t.true(x.equal(y))

  x = Some(2)
  y = None
  t.false(x.equal(y))

  x = None
  y = Some(2)
  t.false(x.equal(y))

  x = None
  y = None
  t.true(x.equal(y))

  // deepEqual
  let ox = Some({foo: 1})
  let oy = Some({foo: 1})
  t.false(ox.equal(oy))
  t.true(ox.equal(oy, true))

  t.end()
})

test('transpose', t => {
  t.true(Ok(Some(5)).equal(Some(Ok(5)).transpose()))

  t.true(Err('error here').equal(Some(Err('error here')).transpose()))

  t.true(Ok(None).equal(None.transpose()))

  try {
    Some(1).transpose()
  } catch (error) {
    t.pass('should throw error if value is not Result')
  }

  t.end()
})

test('nested', t => {
  t.true(Some(Some(5)).equal(Some(Some(5))))
  t.true(Some(None).equal(Some(None)))
  t.true(Some(Ok(5)).equal(Some(Ok(5))))
  t.true(Some(Err(5)).equal(Some(Err(5))))

  t.end()
})

test('.$, similar to ?', t => {
  t.equal(Some(1).$, 1)
  try {
    None.$
  } catch (error) {
    t.true(error instanceof NoneError)
  }

  t.end()
})