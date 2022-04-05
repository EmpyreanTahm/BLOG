---
title: "this 机制"
author: "GeekKery"
date: 2021-01-19T18:03:44+08:00
tags: ["JavaScript"]
---

## 关于 this

如果对于有经验的 JavaScript 开发者来说，this 都是一种非常复杂的机制，那它到底有用在哪里呢？下面来解释一下为什么要使用 this：

```javascript
function identify() {
    return this.name.toUpperCase();
}

var me = {
    name: "Kyle"
};
var you = {
    name: "Reader"
};
identify.call(me);    // Kyle
identify.call(you);   // Reader
```

这段代码可以在不同的上下文对象（me 和 you）中重复使用函数 identify，不用针对每个对象编写不同版本的函数。如果不使用 this，那就需要给 identify 显式传入一个上下文对象。

```javascript
function identify(context) {
    return context.name.toUpperCase();
}

var me = {
    name: "Kyle"
};
var you = {
    name: "Reader"
};
identify(me);    // Kyle
identify(you);   // Reader
```

this 提供了一种更优雅的方式来隐式”传递“一个对象引用，因此可以将 API 设计得更加简洁并且易于复用。随着使用模式越来越复杂，显式传递上下文对象会让代码变得越来越混乱，使用 this 则不会这样。

## 绑定规则

**this 的绑定和函数声明的位置没有任何关系，this 实际上是在函数被调用时发生的绑定，它指向什么完全取决于函数在哪里被调用。**

当一个函数被调用时，会创建一个执行上下文。这个上下文会包含函数在哪里被调用（调用栈）、函数的调用方法、传入的参数等信息。this 就是记录的其中一个属性，会在函数执行的过程中用到。

### 默认绑定

独立函数调用是最常见的函数调用，也是 this 绑定的默认规则。**严格模式下，this 将指向 undefined，非严格模式下将指向全局对象**。

```javascript
function foo() {
	console.log( this.a );
}

var a = 2;
foo(); 			// 2
```

### 隐式绑定

隐式绑定需要考虑的是调用位置是否有上下文对象，或者说是否被某个对象拥有或者包含。

```javascript
function foo() {
    console.log(this.a);
}

var obj = {
    a: 2,
    foo: foo
};
obj.foo(); // 2
```

调用位置会使用 obj 上下文来引用函数，即函数被调用时 obj 对象“拥有”或者“包含”函数。隐式绑定规则会把函数调用中的 this 绑定到这个上下文对象。因为调用 foo 时 this 被绑定到 obj，因此 this.a 和 obj.a 是一样的。

**对象属性引用链中只有最顶层或者说最靠近函数调用的那一层会影响 this 指向**，举例来说：

```javascript
function foo() {
    console.log(this.a);
}

var obj2 = {
    a: 42,
    foo: foo
};
var obj1 = {
    a: 2,
    obj2: obj2
};
obj1.obj2.foo(); // 42，this 受 obj2 影响
```

#### 隐式丢失

一个最常见的 this 绑定问题就是被隐式绑定的函数会丢失绑定对象，也就是说它会应用默认绑定，从而把 this 绑定到全局对象或者 undefined 上。

```javascript
function foo() {
    console.log(this.a);
}

var obj = {
    a: 2,
    foo: foo
};
var bar = obj.foo;        // 函数别名！
var a = "oops, global";   // a 是全局对象的属性
bar();                    // "oops, global"
```

虽然 bar 是 obj.foo 的一个引用，但是实际上，它引用的是 foo 函数本身，因此此时的 bar() 其实是一个不带任何修饰的函数调用，因此应用了默认绑定。

一种更微妙、更常见并且更出乎意料的情况发生在传入回调函数时：

```javascript
function foo() {
    console.log(this.a);
}

function doFoo(fn) {
    // fn 其实引用的是 foo
    fn(); // <-- 调用位置!
}

var obj = {
    a: 2,
    foo: foo
};
var a = "oops, global"; // a 是全局对象的属性
doFoo(obj.foo);       // "oops, global"
```

参数传递其实就是一种隐式赋值，因此我们传入函数时也会被隐式赋值，所以结果和上一个例子一样。如果把函数传入语言内置的函数而不是传入你自己声明的函数，会发生什么呢？结果是一样的，没有区别：

```javascript
function foo() {
    console.log(this.a);
}

var obj = {
    a: 2,
    foo: foo
};
var a = "oops, global";    // a 是全局对象的属性 
setTimeout(obj.foo, 100);  // "oops, global"
```

JavaScript 环境中内置的 setTimeout() 函数实现和下面的伪代码类似：

```javascript
function setTimeout(fn, delay) {
    fn(); // <-- 调用位置!
}
```

就像我们看到的那样，回调函数丢失 this 绑定是非常常见的。除此之外，还有一种情况 this 的行为会出乎我们意料：调用回调函数的函数可能会修改 this。在一些 JavaScript 库中事件处理器常会把回调函数的 this 强制绑定到触发事件的 DOM 元素上。**实际上你无法控制回调函数的执行方式，因此就没有办法控制会影响绑定的调用位置**。

### 显示绑定

就像我们刚才看到的那样，在分析隐式绑定时，我们必须在一个对象内部包含一个指向函数的属性，并通过这个属性间接引用函数，从而把 this 间接（隐式）绑定到这个对象上。 那么如果我们不想在对象内部包含函数引用，而想在某个对象上强制调用函数，该怎么做呢？
可以使用函数的 call(..) 和 apply(..) 方法。严格来说，JavaScript 的宿主环境有时会提供一些非常特殊的函数，它们并没有这两个方法。但是这样的函数非常罕见，JavaScript 提供的绝大多数函数以及你自己创建的所有函数都可以使用 call(..) 和 apply(..) 方法。这两个方法是如何工作的呢？它们的第一个参数是一个对象，它们会把这个对象绑定到 this，接着在调用函数时指定这个 this。因为你可以直接指定 this 的绑定对象，因此我们称之为显式绑定。

```javascript
function foo() {
    console.log(this.a);
}

var obj = {
    a: 2
};
foo.call(obj); // 2
```

通过 foo.call(..)，我们可以在调用 foo 时强制把它的 this 绑定到 obj 上。如果你传入了一个原始值（字符串类型、布尔类型或者数字类型）来当作 this 的绑定对象，这个原始值会被转换成它的对象形式（也就是new String(..)、new Boolean(..)或者 new Number(..)），这通常被称为“装箱”。

由于硬绑定是一种非常常用的模式，所以在 ES5 中提供了内置的方法 Function.prototype.bind，它的用法如下：

```javascript
function foo(something) {
    console.log(this.a, something);
    return this.a + something;
}

var obj = {
    a: 2
};
var bar = foo.bind(obj);
var b = bar(3); // 2 3
console.log(b); // 5
```

**bind(..) 会返回一个硬编码的新函数，它会把参数设置为 this 的上下文并调用原始函数**。

第三方库的许多函数，以及 JavaScript 语言和宿主环境中许多新的内置函数，都提供了一个可选的参数，通常被称为“上下文”（context），其作用和 bind(..) 一样，确保你的回调 函数使用指定的 this。举例来说：

```javascript
function foo(el) {
    console.log(el, this.id);
}

var obj = {
    id: "awesome"
};
// 调用 foo(..) 时把 this 绑定到 obj
[1, 2, 3].forEach(foo, obj);
// 1 awesome 2 awesome 3 awesome
```

这些函数实际上就是通过 call(..) 或者 apply(..) 实现了显式绑定，这样可以少些一些代码。

### new 绑定

在 JavaScript 中，构造函数只是一些使用 new 操作符时被调用的函数。它们并不会属于某个类，也不会实例化一个类。实际上，它们甚至都不能说是一种特殊的函数类型，它们只是被 new 操作符调用的普通函数而已。

使用 new 来调用函数，或者说发生构造函数调用时，会自动执行下面的操作：

1. 创建一个全新的对象；
2. 这个新对象会被执行 [[原型]] 连接；
3. 这个新对象会绑定到函数调用的 this，执行代码；
4. 如果函数没有返回其他对象，那么 new 表达式中的函数调用会自动返回这个新对象。

使用 new 来调用 foo(..) 时，我们会构造一个新对象并把它绑定到 foo(..) 调用中的 this 上：

```javascript
function foo(a) {
  this.a = a
}

var bar = new foo(2)
console.log(bar.a) // 2
```

## 优先级

现在我们可以根据优先级来判断函数在某个调用位置应用的是哪条规则。可以按照下面的
顺序来进行判断:

1. 由 new 调用：绑定到新创建的对象。
2. 由 call、apply 或者 bind 调用：绑定到指定的对象。
3. 由上下文对象调用：绑定到那个上下文对象。
4. 默认：在严格模式下绑定到 undefined，否则绑定到全局对象。

## 绑定例外

我们之前介绍的四条规则已经可以包含所有正常的函数。但是 ES6 中介绍了一种无法使用这些规则的特殊函数类型：箭头函数。箭头函数并不是使用 function 关键字定义的，而是使用 => 定义的。箭头函数不使用 this 的四种标准规则，而是根据外层（函数或者全局）作用域来决定 this，箭头函数的 this 指向的是外部作用域中的 this。

箭头函数可以像 bind(..) 一样确保函数的 this 被绑定到指定对象，此外，其重要性还体现在它用更常见的词法作用域取代了传统的 this 机制。实际上，在 ES6 之前就已经在使用一种几乎和箭头函数完全一样的模式。

```javascript
function foo() {
    var self = this; // lexical capture of this 
    setTimeout(function () {
        console.log(self.a);
    }, 100);
}

var obj = {
    a: 2
};
foo.call(obj); // 2
```

虽然 self = this 和箭头函数看起来都可以取代 bind(..)，但是从本质上来说，它们想替代的是 this 机制。

## 总结

要判断一个运行中函数的 this 绑定，就需要找到这个**函数的直接调用位置**。找到之后就可以顺序上述优先级来判断 this 的绑定对象。要注意有些调用可能在无意中导致隐式丢失而使用默认绑定规则。

如果想”更安全“地忽略 this 绑定，你可以使用一个 DMZ 对象，比如 ø = Object.create(null)，以保护全局对象。

ES6 中的箭头函数并不会使用四条标准的绑定规则，而是根据当前的词法作用域来决定 this，具体来说，箭头函数会继承外层函数调用的 this 绑定。这其实和 ES6 之前代码中的 self = this 机制一样。

## 附：实现 call、apply、bind

```javascript
Function.prototype.customCall = function (context = Object.create(null), ...args) {
    context.fn = this;    // this 是调用 call 的函数
    const result = context.fn(...args);
    delete context.fn;    // 执行后删除新增属性
    return result;
}

Function.prototype.customApply = function (context = Object.create(null), args = []) {
    context.fn = this;    // this 是调用 call 的函数
    const result = context.fn(...args);
    delete context.fn;    // 执行后删除新增属性
    return result;
}

Function.prototype.customBind = function (context, ...args) {
    const _this = this;
    return function Bind(...newArgs) {
        // 考虑是否此函数被继承
        if (this instanceof Bind) {
            return _this.customApply(this, [...args, ...newArgs])
        }
        return _this.customApply(context, [...args, ...newArgs])
    }
}
```

上述 call 和 apply 的实现，实际情况需要考虑应用上下文是否可写，在向应用上下文写入调用函数时，最好使用 Symbol 属性，防止覆盖应用上下文原本的内容。手动实现没有什么意义，重点还是要理解 this。
