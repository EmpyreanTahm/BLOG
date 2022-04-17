---
title: "Vue3 更新内容"
author: "GeekKery"
date: 2022-04-10T17:00:51+08:00
tags: ["Vue"]
draft: true
---

## 计划
- setup
- main
- 响应式
- computed
- inject provide


## Vue.createApp(options).mount(el)
## setup

声明属性和方法，return 对象或渲染函数h

修改属性 propName.value = 'newValue' 形式修改

执行时机：在 beforeCreate 之前执行一次，this 指向 undefined

setup参数：两个参数，props 和 context，context 包括 attrs（$attrs），slots（$slots），emit（$emit），expose
## ref 函数

定义一个响应式数据

语法：const prop = ref(initValue)；
- 创建一个包含响应式数据的引用对象（RefImpl 对象）
- 操作数据 prop.value
- 模板读取：{{ prop }}

备注：基本类型通过 RefImpl 进行 getter 和 setter 劫持；对象类型通过 setter getter 传导到 proxy 实现，内部 reactive 函数实现；

## reactive 函数

定义一个对象类型的响应式数据，基本类型不可用，用 ref 函数；
const 代理对象= reactive(源对象) 接收对象（包括数组），返回一个代理对象（Proxy 的实例对象）；
reactive 响应式通过 proxy 实现，是深层次拦截的，通过代理对象操作源对象内部数据进行操作；

## computed

```javascript
import {computed} from 'vue'
const fullName = computed(()=>{
	return person.firstName + ' ' + person.lastName
})
// set
const fullName = computed({
	get(){
		return person.firstName + ' ' + person.lastName
	}
	set(value){
		person.firstName = value.split(' ')
		person.lastName = value.split(' ')
	}
})
```

## watch

同一属性可配置多个 watch
```javascript
watch(propName,(newValue,oldValue)=>{

},{
	immediate:true,
	deep:true
})
```

## watchEffect

## beforeUnmount unmounted
beforeDestroy 和 destroyed没了

## on+生命周期
```javascript
import { onMouted } from 'vue'
onMounted(()=>{

})
```

## hook 函数（vue2 的 mixin）

## toRef 和 toRefs