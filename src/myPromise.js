// 1. promise 有三个状态：pending，fulfilled，or rejected, 并且只能pending => fulfilled 或者 pending => rejected
// 2. new promise时， 需要传递一个executor()执行器，执行器立即执行
// 3. executor接受两个参数，分别是resolve和reject；
// 4. promise 的默认状态是 pending
// 5. promise 有一个value保存成功状态的值，可以是undefined/thenable/promise
// 6. promise 有一个reason保存失败状态的值
// 7. promise 只能从pending到rejected, 或者从pending到fulfilled，状态一旦确认，就不会再改变
// 8. promise 必须有一个then方法，then 接收两个参数，分别是 promise 成功的回调 onFulfilled, 和 promise 失败的回调 onRejected
// 9. 如果调用 then 时，promise 已经成功，则执行onFulfilled，参数是promise的value
// 10. 如果调用 then 时，promise 已经失败，那么执行onRejected, 参数是promise的reason
// 11. 如果 then 中抛出了异常，那么就会把这个异常作为参数，传递给下一个 then 的失败的回调onRejected

// 我们在实际使用promise的过程中， 有如下几个用法：
// Promise.then() 
//    接收两个参数 onFulfilled （成功回调） onRejected （失败回调）  onFulfilled 和 onRejected 都是可选参数
//    onFulfilled 和 onRejected 应该是微任务
//    onFulfilled 和 onRejected 必须作为函数被调用
//    then方法可能被多次调用
//    then必须返回一个promise
//    then 的参数 onFulfilled 和 onRejected 可以缺省，如果 onFulfilled 或者 onRejected不是函数，将其忽略，且依旧可以在下面的 then 中获取到之前返回的值
//    promise 可以 then 多次，每次执行完 promise.then 方法后返回的都是一个“新的promise"
//    如果 then 的返回值 x 是一个普通值，那么就会把这个结果作为参数，传递给下一个 then 的成功的回调中
//    如果 then 中抛出了异常，那么就会把这个异常作为参数，传递给下一个 then 的失败的回调中
//    如果 then 的返回值 x 是一个 promise，那么会等这个 promise 执行完，promise 如果成功，就走下一个 then 的成功；如果失败，就走下一个 then 的失败；如果抛出异常，就走下一个 then 的失败
//    如果 then 的返回值 x 和 promise 是同一个引用对象，造成循环引用，则抛出异常，把异常传递给下一个 then 的失败的回调中
//    如果 then 的返回值 x 是一个 promise，且 x 同时调用 resolve 函数和 reject 函数，则第一次调用优先，其他所有调用被忽略

// Promise.resolve()
//    默认产生一个成功的 promise。具备等待功能的。如果参数是 promise 会等待这个 promise 解析完毕，在向下执行

// Promise.reject()
//    默认产生一个失败的 promise，Promise.reject 是直接将值变成错误结果

// Promise.prototype.catch()
//    用来捕获 promise 的异常，就相当于一个没有成功的 then

// Promise.prototype.finally()
//    无论如何都会执行,如果返回一个 promise 会等待这个 promise 也执行完毕。如果返回的是成功的 promise，会采用上一次的结果；如果返回的是失败的 promise，会用这个失败的结果，传到 catch 中

// Promise.all()
//    解决并发问题的，多个异步并发获取最终的结果（如果有一个失败则失败）

// Promise.race
//    返回一个 Promise，它将与第一个传递的 promise 相同的完成方式被完成。它可以是完成（ resolves），也可以是失败（rejects），这要取决于第一个完成的方式是两个中的哪个。
//    如果传的参数数组是空，则返回的 promise 将永远等待。
//    如果迭代包含一个或多个非承诺值和/或已解决/拒绝的承诺，则 Promise.race 将解析为迭代中找到的第一个值。

class myPromise {
  static PENDING = 'pending';
  static FULFILLED = 'fulfilled';
  static REJECTED = 'rejected';

  constructor(func) {
    // 默认状态 PENDING
    this.status = myPromise.PENDING; 
    // 成功状态的值
    this.result = undefined;
    // 失败状态的值
    this.reason = undefined;
    // 存放成功的回调
    this.resolveCallbacks = [];
    // 存放失败的回调
    this.rejectCallbacks = []

    try {
       /**
         * func()传入resolve和reject，
         * resolve()和reject()方法在外部调用，这里需要用bind修正一下this指向
         * new 对象实例时，自动执行func()
         */
        func(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      reject(error)
    }
  }
  /**
   * 成功态时接收的终值
   */
  resolve (value){
    if(this.status ===  myPromise.PENDING) {
      this.status = myPromise.FULFILLED;
      this.result = value;
      // 发布订阅模式， this.resolveCallbacks.forEach 发布
      // 异步的时候才会执行，同步状态（this.resolveCallbacks => []）
      // 同步是没有PENDING状态的 走的是then方法里面的this.status === myPromise.FULFILLED
      this.resolveCallbacks.forEach(fn=>fn());
    }
  } 
 /**
   * 拒绝态时接收的终值
   */
  reject (reason) {
    if(this.status ===  myPromise.PENDING) {
      this.status = myPromise.REJECTED;
      this.reason = reason;
      // 同步是没有PENDING状态的 走的是then方法里面的this.status === myPromise.REJECTED
      this.rejectCallbacks.forEach(fn=>fn());
    }
  }

  catch (onRejected) {
    return this.then(undefined, onRejected)
  }

  finally(callBack) {
    return this.then(callBack, callBack)
  }

  /**
   * then 方法必须返回一个 promise 对象
   * @param {*} onFulfilled  fulfilled状态时 执行的函数
   * @param {*} onRejected rejected状态时 执行的函数 
   */
  then (onFulfilled, onRejected) {
  // 当onFULFILLED为空的时候，实现值穿透
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
  onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };
  let promise2 = new myPromise((resolve, reject) => {
      if (this.status === myPromise.PENDING) {
        // 发布订阅模式 订阅成功回调事件 微任务 
        // 异步处理 promise2存在
        this.resolveCallbacks.push(() => {
          queueMicrotask(()=> {
            try {
              let x = onFulfilled(this.result)
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err)
            }
          })
        })
        this.rejectCallbacks.push(() => {
          queueMicrotask(()=> {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err)
            }
        
          })
      
        })
      }
      if (this.status === myPromise.FULFILLED) {
         queueMicrotask(() => {
          try {
            let x = onFulfilled(this.result)
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err)
          }

        })
      }
      if (this.status === myPromise.REJECTED) {
        queueMicrotask(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err)
          }

        })
      }
    })
    return promise2
  }

  static reject(reason) {
    return new myPromise((resolve, reject) => {
        reject(reason);
    })
  }

  static resolve(value){
    if (value instanceof myPromise) {
        return value;
    } else if (value instanceof Object && 'then' in value) {
        // 如果这个值是thenable（带有`"then" `方法），返回的promise会“跟随”这个thenable的对象
        return new myPromise((resolve, reject) => {
            value.then(resolve, reject);
        })
    }
    // 否则返回的promise将以此值完成，即以此值执行`resolve()`方法 (状态为fulfilled)
    return new myPromise((resolve) => {
        resolve(value)
    })
  }

  static all(promises) {
    return new myPromise((resolve, reject) => {
        // 参数校验
        if (Array.isArray(promises)) {
            let result = []; // 存储结果
            let count = 0; // 计数器

            // 如果传入的参数是一个空的可迭代对象，则返回一个已完成（already resolved）状态的 Promise
            if (promises.length === 0) {
                return resolve(promises);
            }
            promises.forEach((item, index) => {
                //  判断参数是否为promise与thenable对象
                   if (item instanceof myPromise || (item instanceof Object && 'then' in item)) {
                    myPromise.resolve(item).then(
                        value => {
                            count++;
                            // 每个promise执行的结果存储在result中
                            result[index] = value;
                            // Promise.all 等待所有都完成（或第一个失败）
                            count === promises.length && resolve(result);
                        },
                        reason => {
                            /**
                             * 如果传入的 promise 中有一个失败（rejected），
                             * Promise.all 异步地将失败的那个结果给失败状态的回调函数，而不管其它 promise 是否完成
                             */
                            reject(reason);
                        }
                    )
                } else {
                    // 参数里中非Promise值，原样返回在数组里
                    count++;
                    result[index] = item;
                    count === promises.length && resolve(result);
                }
            })
        } else {
            return reject(new TypeError('Argument is not iterable'))
        }
    })
  }
}
  
// resolvePromise方法
// 1. 如果 promise2 和 x 相等，那么 reject promise with a TypeError
// 2. 如果 x 是一个 promsie
//      2.1 如果x是pending态，那么promise必须要在pending,直到 x 变成 fulfilled or rejected
//      2.2 如果 x 被 fulfilled, fulfill promise with the same value.
//      2.3 如果 x 被 rejected, reject promise with the same reason.
// 3. 如果 x 是一个 object 或者 是一个 function
// 4. 如果 x 不是一个 object 或者 function，fulfill promise with x.


const resolvePromise = (promise2, x, resolve, reject) => {
  // 自己等待自己完成是错误的实现，用一个类型错误，结束掉 promise
  if (promise2 === x) { 
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  // 只能调用一次
  let called;
  if ((typeof x === 'object' && x != null) || typeof x === 'function') { 
    try {
      // 为了判断 resolve 过的就不用再 reject 了（比如 reject 和 resolve 同时调用的时候） 
      let then = x.then;
      if (typeof then === 'function') { 
        // 不要写成 x.then，直接 then.call 就可以了 因为 x.then 会再次取值，Object.defineProperty
        then.call(x, y => { // 根据 promise 的状态决定是成功还是失败
          if (called) return;
          called = true;
          // 递归解析的过程 因为可能 promise 中还有 promise
          resolvePromise(promise2, y, resolve, reject); 
        }, r => {
          // 只要失败就失败
          if (called) return;
          called = true;
          reject(r);
        });
      } else {
        // 如果 x.then 是个普通值就直接返回 resolve 作为结果 
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e)
    }
  } else {
    // 如果 x 是个普通值就直接返回 resolve 作为结果
    resolve(x)
  }
}

/**
 * 测试时需要的方法
 */
myPromise.deferred = function () {
  let result = {};
  result.promise = new myPromise((resolve, reject) => {
      result.resolve = resolve;
      result.reject = reject;
  });
  return result;
}

module.exports = myPromise;