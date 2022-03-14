# 手写Promise

## 测试myPromise是否符合规范

依赖安装

```bash
npm install
```

在 promise 实现的代码中，增加以下代码:

```ts
myPromise.deferred = function () {
  let result = {};
  result.promise = new myPromise((resolve, reject) => {
      result.resolve = resolve;
      result.reject = reject;
  });
  return result;
}
```

安装测试脚本:

```bash
npm install -g promises-aplus-tests
```

修改package.js

```js
  "scripts": {
    "test": "promises-aplus-tests src/myPromise"
  },
```

执行命令
```bash
 npm run test
```
