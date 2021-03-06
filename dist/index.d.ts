import a = require('./IOption');
export import Option = a.Option;
export import NoneError = a.NoneError;
import b = require('./IResult');
export import Result = b.Result;
import { Option } from './IOption';
import { Result } from './IResult';
export declare const Arguments: unique symbol;
export declare function Some<T>(value: T): Option<T>;
export declare const None: Option<any>;
export declare function Ok<T>(value: T): Result<T, any>;
export declare function Err<E>(error: E): Result<any, E>;
export declare function makeMatch(branches: (((x: any) => any) | [any, any | ((x?: any) => any)])[], deep?: boolean): (opt: any) => any;
export declare function match(opt: any, branches: (((x: any) => any) | [any, any | ((x?: any) => any)])[], deep?: boolean): any;
export declare function resultifySync<T, E>(func: (x?: any) => T): (...args: any[]) => Result<T, E>;
export declare function resultify<T, E>(func: (x?: any) => T): (...args: any[]) => Promise<Result<T, E>>;
export declare function optionifySync<T>(func: (x?: any) => T): (...args: any[]) => Option<T>;
export declare function optionify<T>(func: (x?: any) => T): (...args: any[]) => Promise<Option<T>>;
