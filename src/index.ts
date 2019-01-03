import lodashEqual from 'lodash.isequal'
import a = require('./IOption')
export import Option = a.Option
import b = require('./IResult')
export import Result = b.Result

import { Option } from './IOption'
import { Result } from './IResult'

function matchObject(value:any, matcher:any, getValue:Function, deep:boolean):boolean {
  const mProps = Object.getOwnPropertyNames(matcher)
  return mProps.every(p => innerMatch(value[p], matcher[p], getValue, deep))
}

function innerMatch(thisValue:any, value:any, getValue:Function, deep:boolean):boolean {
  // recursive
  if ((value instanceof some && thisValue instanceof some)
    || (value instanceof ok && thisValue instanceof ok)
    || (value instanceof err && thisValue instanceof err)) {
    return innerMatch(getValue(thisValue), getValue(value), getValue, deep)
  }

  let isMatch = false

  // equal is a kind of perfect match
  if (deep) {
    isMatch = lodashEqual(thisValue, value)
  } else {
    isMatch = (thisValue === value) || (Number.isNaN(thisValue) && Number.isNaN(value))
  }
  if (isMatch) return true

  // check basic type
  // following statements are all true
  // Some(1).match(Some(Number))
  // Some('yeah').match(Some(String))
  // Some(false).match(Some(Boolean))
  // Some(function f(){}).match(Some(Function))
  // Some(Date.now()).match(Some(Date))
  // Some([1,2,4]).match(Some(Array))
  // Some(/foo/).match(Some(RegExp))
  // Some(new Set).match(Some(Set))
  // Some(new Map).match(Some(Map))
  const type = Object.prototype.toString.call(thisValue).slice(8, -1)
  switch (type) {
    case 'Number':
      value === Number && (isMatch = true)
      break
    case 'String':
      value === String && (isMatch = true)
      break
    case 'Boolean':
      value === Boolean && (isMatch = true)
      break
    case 'Function':
      value === Function && (isMatch = true)
      break
    case 'Date':
      value === Date && (isMatch = true)
      break
    case 'Array':
      value === Array && (isMatch = true)
      break
    case 'RegExp':
      value === RegExp && (isMatch = true)
      break
    case 'Map':
      value === Map && (isMatch = true)
      break
    case 'Set':
      value === Set && (isMatch = true)
      break
    case 'Object':
      // class A {}
      // new A match A
      // new B match A if B extends A
      switch (Object.prototype.toString.call(value).slice(8, -1)) {
        case 'Function':
          thisValue instanceof value && (isMatch = true)
          break
        case 'Object':
          isMatch = matchObject(thisValue, value, getValue, deep)
          break
        default:
          break;
      }
      break
    default:
      break
  }
  if (isMatch) return true

  return false
}

class some<T> implements Option<T> {
  private value:T

  constructor(value:T) {
    this.value = value
  }

  isNone() {
    return false
  }

  isSome() {
    return true
  }

  expect() {
    return this.value
  }

  unwrap() {
    return this.value
  }

  // @ts-ignore: noUnusedParameters
  unwrapOr(placeholder:T):T {
    return this.value
  }

  // @ts-ignore: noUnusedParameters
  unwrapOrElse(placeholderFn:()=>T):T {
    return this.value
  }

  map<U>(fn:(value:T)=>U):Option<U> {
    return Some(fn(this.value))
  }

  // @ts-ignore: noUnusedParameters
  mapOr<U>(placeholder:U, fn:(value:T)=>U):U {
    return fn(this.value)
  }

  // @ts-ignore: noUnusedParameters
  mapOrElse<U>(placeholderFn:()=>U, fn:(value:T)=>U):U {
    return fn(this.value)
  }

  and<U>(optb:Option<U>):Option<U> {
    return optb
  }

  andThen<U>(fn:(value:T)=>Option<U>):Option<U> {
    return fn(this.value)
  }

  filter(predicate:(value:T)=>boolean):Option<T> {
    return predicate(this.value) ? this : None
  }

  // @ts-ignore: noUnusedParameters
  or(optb:Option<T>):Option<T> {
    return this
  }

  // @ts-ignore: noUnusedParameters
  orElse(fn:()=>Option<T>):Option<T> {
    return this
  }

  xor(optb:Option<T>):Option<T> {
    return optb.isNone() ? this : None
  }

  transpose<U, E>():Result<Option<U>, E> {
    if (this.value instanceof ok) {
      return Ok(Some(this.value.unwrap()))
    } else if (this.value instanceof err) {
      return Err(<E>this.value.unwrapErr())
    } else {
      throw new Error('value is not Result!')
    }
  }

  equal(optb:Option<T>, deep:boolean=false):boolean {
    if (optb.isSome()) {
      const value = optb.unwrap()
      // recursive
      if (value instanceof some && this.value instanceof some) {
        return this.value.equal(value, deep)
      }
      if (value instanceof ok && this.value instanceof ok) {
        return this.value.equal(value, deep)
      }
      if (value instanceof err && this.value instanceof err) {
        return this.value.equal(value, deep)
      }

      // check
      if (deep) {
        return lodashEqual(this.value, value)
      } else {
        return (this.value === value) || (Number.isNaN(<any>this.value) && Number.isNaN(<any>value))
      }
    }
    return false
  }

  match(optb:Option<T>, deep:boolean=false):boolean {
    if (optb.isSome()) {
      const value = <any>optb.unwrap()
      return innerMatch(this.value, value, (x:Option<T>)=>x.isSome()?x.unwrap():None, deep)
    }

    return false
  }
}

class none<T> implements Option<T> {

  isNone() {
    return true
  }

  isSome() {
    return false
  }

  expect(msg:string) {
    throw new Error(msg)
  }

  unwrap() {
    throw new Error('cannot unwrap None')
  }

  unwrapOr(placeholder:T):T {
    return placeholder
  }

  unwrapOrElse(placeholderFn:()=>T):T {
    return placeholderFn()
  }

  // @ts-ignore: noUnusedParameters
  map<U>(fn:(value:T)=>U):Option<U> {
    return None
  }

  // @ts-ignore: noUnusedParameters
  mapOr<U>(placeholder:U, fn:(value:T)=>U):U {
    return placeholder
  }

  // @ts-ignore: noUnusedParameters
  mapOrElse<U>(placeholderFn:()=>U, fn:(value:T)=>U):U {
    return placeholderFn()
  }

  // @ts-ignore: noUnusedParameters
  and<any>(optb:Option<U>):Option<any> {
    return this
  }

  // @ts-ignore: noUnusedParameters
  andThen<any>(fn:(value:T)=>Option<U>):Option<any> {
    return this
  }

  // @ts-ignore: noUnusedParameters
  filter(predicate:(value:T)=>boolean):Option<T> {
    return this
  }

  or(optb:Option<T>):Option<T> {
    return optb
  }

  orElse(fn:()=>Option<T>):Option<T> {
    return fn()
  }

  xor(optb:Option<T>):Option<T> {
    return optb.isSome() ? optb : this
  }

  transpose<E>():Result<Option<any>, E> {
    return Ok(this)
  }

  equal(optb:Option<any>):boolean {
    return optb.isNone()
  }

  match(optb:Option<any>):boolean {
    return optb.isNone()
  }
}

export function Some<T>(value:T):Option<T> {
  return new some(value)
}

export const None:Option<any> = new none

class ok<T, E> implements Result<T, E>  {
  private value:T

  constructor(value:T) {
    this.value = value
  }

  isOk():boolean {
    return true
  }

  isErr():boolean {
    return false
  }

  ok():Option<T> {
    return Some(this.value)
  }

  err():Option<E> {
    return None
  }

  map<U>(op:(t:T)=>U):Result<U, E> {
    return Ok(op(this.value))
  }

  // @ts-ignore: noUnusedParameters
  mapOrElse<U>(fallback:(e:E)=>U, map:(t:T)=>U):U {
    return map(this.value)
  }

  // @ts-ignore: noUnusedParameters
  mapErr<F>(op:(e:E)=>F):Result<T, F> {
    return Ok(this.value)
  }

  and<U>(res:Result<U, E>):Result<U, E> {
    return res
  }

  andThen<U>(op:(t:T)=>Result<U, E>):Result<U, E> {
    return op(this.value)
  }

  // @ts-ignore: noUnusedParameters
  or(res:Result<T, F>):Result<T, F> {
    return this
  }

  // @ts-ignore: noUnusedParameters
  orElse(op:(e:E)=>Result<T, F>):Result<T, F> {
    return this
  }

  // @ts-ignore: noUnusedParameters
  unwrapOr(optb:T):T {
    return this.value
  }

  // @ts-ignore: noUnusedParameters
  unwrapOrElse(op:(e:E)=>T):T {
    return this.value
  }

  unwrap():T {
    return this.value
  }

  // @ts-ignore: noUnusedParameters
  expect(msg:string):T {
    return this.value
  }

  unwrapErr():E {
    throw new Error(String(this.value))
  }

  expectErr(msg:string):E {
    throw new Error(msg + ': ' + String(this.value))
  }

  transpose():Option<Result<T, E>> {
    if (this.value instanceof some) {
      return Some(Ok(this.value.unwrap()))
    } else if (this.value instanceof none) {
      return None
    } else {
      throw new Error('value is not Option!')
    }
  }

  equal(resb:Result<T, E>, deep?:boolean):boolean {
    if (resb.isOk()) {
      const value = resb.unwrap()
      if (value instanceof some && this.value instanceof some) {
        return this.value.equal(value, deep)
      }
      if (value instanceof ok && this.value instanceof ok) {
        return this.value.equal(value, deep)
      }
      if (value instanceof err && this.value instanceof err) {
        return this.value.equal(value, deep)
      }
      if (deep) {
        return lodashEqual(this.value, value)
      } else {
        return this.value === value
      }
    }
    return false
  }

  match(resb:Result<T, E>, deep:boolean=false):boolean {
    if (resb.isOk()) {
      const value = <any>resb.unwrap()
      return innerMatch(this.value, value, (x:Result<T, E>)=>x[x.isOk()? 'unwrap' : 'unwrapErr'](), deep)
    }

    return false
  }
}

class err<T, E> implements Result<T, E> {
  private error:E

  constructor(error:E) {
    this.error = error
  }

  isOk():boolean {
    return false
  }

  isErr():boolean {
    return true
  }

  ok():Option<T> {
    return None
  }

  err():Option<E> {
    return Some(this.error)
  }

  // @ts-ignore: noUnusedParameters
  map(op:(t:T)=>U):Result<U, E> {
    return Err(this.error)
  }

  // @ts-ignore: noUnusedParameters
  mapOrElse<U>(fallback:(e:E)=>U, map:(t:T)=>U):U {
    return fallback(this.error)
  }

  mapErr<F>(op:(e:E)=>F):Result<T, F> {
    return Err(op(this.error))
  }

  // @ts-ignore: noUnusedParameters
  and<U>(res:Result<U, E>):Result<U, E> {
    return Err(this.error)
  }

  // @ts-ignore: noUnusedParameters
  andThen(op:(t:T)=>Result<U, E>):Result<U, E> {
    return Err(this.error)
  }

  or<F>(res:Result<T, F>):Result<T, F> {
    return res
  }

  orElse<F>(op:(e:E)=>Result<T, F>):Result<T, F> {
    return op(this.error)
  }

  unwrapOr<T>(optb:T):T {
    return optb
  }

  unwrapOrElse<T>(op:(e:E)=>T):T {
    return op(this.error)
  }

  unwrap():T {
    throw new Error(String(this.error))
  }

  expect(msg:string):T {
    throw new Error(msg + ': ' + String(this.error))
  }

  unwrapErr():E {
    return this.error
  }

  // @ts-ignore: noUnusedParameters
  expectErr(msg:string):E {
    return this.error
  }

  transpose():Option<Result<T, E>> {
    return Some(Err(this.error))
  }

  // @ts-ignore: noUnusedParameters
  equal<T>(resb:Result<T, E>, deep?:boolean):boolean {
    if (resb.isErr()) {
      const error = resb.unwrapErr()
      if (error instanceof some && this.error instanceof some) {
        return this.error.equal(error, deep)
      }
      if (error instanceof ok && this.error instanceof ok) {
        return this.error.equal(error, deep)
      }
      if (error instanceof err && this.error instanceof err) {
        return this.error.equal(error, deep)
      }
      if (deep) {
        return lodashEqual(this.error, error)
      } else {
        return this.error === error
      }
    }
    return false
  }

  match(resb:Result<T, E>, deep:boolean=false):boolean {
    if (resb.isErr()) {
      const error = <any>resb.unwrapErr()
      return innerMatch(this.error, error, (x:Result<T, E>)=>x[x.isOk()? 'unwrap' : 'unwrapErr'](), deep)
    }

    return false
  }
}

export function Ok<T>(value:T):Result<T, any> {
  return new ok(value)
}

export function Err<E>(error:E):Result<any, E> {
  return new err(error)
}

// helper functions
export function makeMatch<T>(branches:(((x:Option<T>)=>any) | [Option<any>, (x?:Option<T>)=>any])[], deep:boolean=false):(opt:Option<T>)=>any {
  return (x:Option<T>) => {
    for(let i=0,len=branches.length; i<len; i++) {
      const branch = branches[i]
      if (typeof branch === 'function') {  // default
        return branch(x)
      } else {
        if (x.equal(branch[0], deep)) {
          return branch[1]()
        }
      }
    }

    // no match, not allow
    throw new Error('non-exhaustive patterns')
  }
}

export function match<T>(opt:Option<T>, branches:(((x:Option<T>)=>any) | [Option<any>, (x?:Option<T>)=>any])[], deep:boolean=false):any {
  return makeMatch<T>(branches, deep)(opt)
}