function Super(name) {
    this.name = name
    this.colors = ["red", "blue", "green"]
}

Super.prototype.sayName = function () {
    console.log(this.name);
}

function Sub(name, age) {
    Super.call(this, name)
    this.age = age
}

// 原型链继承
Sub.prototype = Object.create(Super.prototype)
Sub.prototype.constructor = Sub

Sub.prototype.sayAge = function () {
    console.log(this.age);
}

let instance1 = new Sub('小明', 15)
let instance2 = new Sub('小王', 18)

instance1.colors.push('black')
console.log(instance1.colors);   // [ 'red', 'blue', 'green', 'black' ]
console.log(instance2.colors);   // [ 'red', 'blue', 'green']
