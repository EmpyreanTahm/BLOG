---
title: "JavaScript：作用域和闭包"
author: "GeeKery"
date: 2021-01-18T15:03:44+08:00
image: "images/head_three.jpg"
categories: ["ECMAScript"]
tags: ["JS系列"]
---

## 词法作用域

作用域是一套规则，这套规则用来管理引擎如何在当前的作用域以及嵌套的子作用域中根据标识符名称进行变量查找。作用域共有两种主要的工作模型。第一种是最为普遍的，被大多数编程语言所采用的**词法作用域**，另外一种叫做**动态作用域**，仍有一些编程语言在使用（比如 Bash 脚本、Perl 中的一些模式等）。JavaScript 中的作用域就是**词法作用域**。

词法作用域就是定义在词法阶段的作用域。换句话说，词法作用域是由你**在写代码时将变量和块作用域写在哪里**来决定的，因此当词法分析器处理代码时会保持作用域不变。无论函数在哪里被调用，也无论它如何被调用，它的词法作用域都只由**函数被声明时所处的位置**决定。

### 欺骗词法

如果词法作用域完全由写代码期间函数所声明的位置来定义，怎样才能在运行时来“修改”（即欺骗）词法作用域呢？

JavaScript 中有两种机制来实现这个目的：eval(..) 函数和 with 关键字。前者可以对一段包含一个或多个声明的“代码”字符串进行演算，并借此来修改已经存在的词法作用域（在运行时）。后者本质上是通过将一个对象的引用当作作用域来处理，将对象的属性当作作用域中的标识符来处理，从而创建了一个新的词法作用域（同样是在运行时）。

这两个机制的副作用是引擎无法在编译时对作用域查找进行优化，因为引擎只能谨慎地认为这样的优化是无效的。使用这其中任何一个机制都将导致代码运行变慢。避免使用它们。

## 动态作用域

动态作用域并不关心函数和作用域是如何声明以及在何处声明的，只关心它们从何处调用。换句话说，作用域链是基于调用栈的，而不是代码中的作用域嵌套。

因此，如果 JavaScript 具有动态作用域，**理论上**，下面代码中的 foo() 在执行时将会输出 3。

```javascript
function foo() {
	console.log(a) // 3(不是 2 !)
}
function bar() {
  var a = 3
	foo()
}
var a = 2
bar()
```

为什么会这样？因为当 foo() 无法找到 a 的变量引用时，会顺着调用栈在调用 foo() 的地方查找 a，而不是在嵌套的词法作用域链中向上查找。由于 foo() 是在 bar() 中调用的，引擎会检查 bar() 的作用域，并在其中找到值为 3 的变量 a。

需要明确的是，事实上 JavaScript 并不具有动态作用域。它只有词法作用域，简单明了。但是 this 机制某种程度上很像动态作用域。

词法作用域是在写代码或者说定义时确定的，而动态作用域是在运行时确定的。词法作用域关注函数在何处声明，而动态作用域关注函数从何处调用。

## 函数作用域和块作用域

函数是 JavaScript 中最常见的作用域单元。本质上，声明在一个函数内部的变量或函数会在所处的作用域中“隐藏”起来，这是有意为之的良好软件的设计原则。但函数不是唯一的作用域单元。块作用域指的是变量和函数不仅可以属于所处的作用域，也可以属于某个代码块（通常指 { .. } 内部）。

从 ES3 开始，try/catch 结构在 catch 分句中具有块作用域，用 with 从对象中创建出的作用域仅在 with 声明中而非外部作用域中有效。在 ES6 中引入了 let 和 const 关键字，用来在任意代码块中声明变量。

函数作用域常被用于隐藏内部实现、规避命名冲突和模块管理等用途，如常用的立即执行函数表达式。

```javascript
var a = 2

(function foo() { 
  var a = 3
  console.log(a) // 3
})()

console.log(a) // 2

```

## 提升

变量**声明**和函数**声明**在编译阶段会被提升，而包括函数表达式的赋值在内的赋值操作并不会提升。在提升过程中，**函数声明优先**。

## 闭包

```javascript
function foo() {
  var a = 2
  function bar() {
    console.log(a)
  }
	return bar
}
var baz = foo()
baz() // 2 —— 这就是闭包的效果。
```

函数 bar() 的词法作用域能够访问 foo() 的内部作用域。在 foo() 执行后，其返回值 bar 函数赋值给变量 baz 并调用 baz()，实际上只是通过不同的标识符引用调用了内部的函数 bar()。但是在这个例子中，它在自己定义的词法作用域以外的地方执行。

在 foo() 执行后，通常会期待 foo() 的整个内部作用域都被销毁，因为我们知道引擎有垃圾回收器用来释放不再使用的内存空间。由于看上去 foo() 的内容不会再被使用，所以很自然地会考虑对其进行回收。

而闭包的“神奇”之处正是可以阻止这件事情的发生。事实上内部作用域依然存在，因此没有被回收。谁在使用这个内部作用域？就是 bar() 本身在使用。

**函数在当前词法作用域之外执行时，依然可以记住并访问其所在的词法作用域，这时就产生了闭包**。

在定时器、事件监听器、 AJAX 请求、跨窗口通信、Web Workers 或者任何其他的异步（或者同步）任务中，只要使用了回调函数，实际上就是在使用闭包！

由于闭包会使得外层函数中的变量常驻内存，消耗较大，因此不能滥用闭包，否则会造成网页的性能问题，使用不当会很容易造成内存泄露。闭包不在使用时，需要将内层函数变量赋值为 null，等待垃圾回收。

### 循环和闭包

```javascript
for (var i = 1; i <= 5; i++) {
    setTimeout(function timer() {
        console.log(i)
    }, i * 1000)
}
```

这段代码在运行时会以每秒一次的频率输出五次 6，而非预期的从 1 到 5。延迟函数的回调会在循环结束时才执行，当定时器运行时即使每个迭代中执行的是 setTimeout(.., 0)，所有的回调函数依然是在循 环结束后才会被执行，因此会每次输出一个 6 出来。

通过闭包修正：

```javascript
for (var i = 1; i <= 5; i++) {
    (function (j) {
        setTimeout(function timer() {
            console.log(j)
        }, j * 1000)
    })(i)
}
```

### 防抖（debounce）

防抖即防止抖动，以免事件被频繁触发的同时，执行回调函数，浪费计算资源。防抖所应用的场景：

- 登录、发短信等按钮需要处理用户的频繁点击，以避免多次请求发送请求
- input 关联搜索展示下拉选择，当用户输入频率变慢到一定标准时执行请求
- 调整浏览器窗口大小时，resize 不断出发事件函数，造成频繁计算
- 文本编辑器实时保存，当无任何更改操作数秒后进行保存请求

防抖的原理是，事件触发时给回调函数添加有延迟的定时器，如果在延迟时间内事件再次被触发，则使用 clearTimeout 清除定时器。

```javascript
const debounce = (func, delay) => {
    let timer

    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            func.apply(this, [args])
        }, delay)
    }
}

const debounceMousemove = debounce(e => {
    console.log(`Event data：${e}`)
}, 300)

document.addEventListener('mousemove', function (e) {
    console.log('mousemove')
    debounceMousemove(e)
})
```
### 节流（throttle）

节流即控制流量，首先选择适当的间隔时间如 1s，事件被频繁触发期间，固定每隔 1s 执行一次事件回调函数。节流的应用场景：

- 监听 scroll 事件，当滑到底部自动加载更多的内容，用节流降低计算频率
- 音视频播放时，每隔 1s 计算一次进度信息

相对于防抖，节流的重点在加锁，只要定时器存在便不理会，否则添加定时器，并在其执行后使用赋值为 null 的方式清除定时器。

```javascript
const throttle = (func, interval) => {
    let timer
  
    return (...args) => {
        if (timer) { return }
        timer = setTimeout(() => {
            func.apply(this, [args])
            timer = null
        }, interval)
    }
}

const throttleMousemove = throttle(e => {
    console.log(`Event data：${e}`)
}, 500)

document.addEventListener('mousemove', function (e) {
    console.log('mousemove')
    throttleMousemove(e)
})
```

### 单例模式

```javascript
class UserSingleton {
    constructor(name) {
        this.name = name
        this.getName()
    }

    getName() {
        return this.name
    }
}

const Singleton = (function () {
    let instance = null

    return function (name) {
        if (!instance) {
            instance = new UserSingleton(name)
        }
        return instance
    }
})()

const bob = Singleton("bob")
const jack = Singleton("jack")

console.log(bob === jack)    // true
console.log(bob, jack)	     // UserSingleton { name: 'bob' } UserSingleton { name: 'bob' }

```



### 模块化

```javascript
var Module = (function Manager() {
    var modules = {}

    function define(name, deps, impl) {
        for (var i = 0; i < deps.length; i++) {
            deps[i] = modules[deps[i]]
        }
        modules[name] = impl.apply(impl, deps)
    }

    function get(name) {
        return modules[name]
    }

    return {
        define: define,
        get: get
    }
})()
```

