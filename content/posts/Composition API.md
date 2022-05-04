---
title: "Composition API"
author: "GeekKery"
date: 2022-04-10T17:00:51+08:00
tags: ["Vue"]
---

Vue3 中的更新内容不少，Composition API 是最吸引人的功能。

某个视图包含多个功能：获取列表数据、搜索和筛选过滤等。Vue3 之前的 Options API 注定同一功能的 props、data、computed、watch 和 methods 等相关属性和方法被隔离开来，功能越繁多，碎片化越严重。为开发或修改某一功能，需要在 Vue 实例的 options 之间频繁切换。

现在，通过 Composition API 可将组件中某一功能的 props、data、computed、watch 和 methods 等相关属性和方法进行聚合，避免碎片化。


## setup

Vue 实例新增 setup(props,context) 函数属性，在组件被创建之前执行，props 被解析完成，setup 就被作为 Composition API 的入口。

setup 的执行时机为 beforeCreate 钩子之前，无法通过 this 访问 Vue 实例。

### props 参数

props 为接收属性，**使用 ES6 解构会消除 props 的响应式**。若需解构 props，在 setup 函数中使用 toRefs 函数：

```javascript
import { toRefs } from 'vue'
setup(props) {
  const { title } = toRefs(props)
  console.log(title.value)
}
```

若 title 可选，则可能 props 中没有 title，需使用 toRef 替代：

```javascript
import { toRef } from 'vue'
setup(props) {
  const title = toRef(props, 'title')
  console.log(title.value)
}
```

### context 参数

context 参数是一个普通的 JavaScript 对象，暴露一些常用的值 { props, attrs, slots, emit }。非响应式，随意解构。

attrs 和 slots 是有状态的对象，它们总是会随组件本身的更新而更新。这意味着应该避免对它们进行解构，并始终以 attrs.x 或 slots.x 的方式引用。

```javascript
export default {
  setup(props, { attrs, slots, emit, expose }) {
    // Attribute (非响应式对象，等同于 $attrs)
    console.log(attrs)
    // 插槽 (非响应式对象，等同于 $slots)
    console.log(slots)
    // 触发事件 (方法，等同于 $emit)
    console.log(emit)
    // 暴露公共 property (函数)
    console.log(expose)
  }
}
```

### 返回值（对象或渲染函数）

setup 可以 return 模板使用的数据对象。模板中使用自动浅解包，不需以 .value 的形式使用。


setup 还可以 return 一个渲染函数，若需将此组件的方法通过模板 ref 暴露给父组件可使用 expose 解决：

```javascript
import { h, ref } from 'vue'
export default {
  setup(props, { expose }) {
    const count = ref(0)
    const increment = () => ++count.value

    expose({
      increment
    })

    return () => h('div', count.value)
  }
}
```

## 响应式

### ref 函数

ref 函数为任意类型的值创建一个响应式引用：

```javascript
import { ref } from 'vue'
export default {
    setup(props, { expose }) {
        const counter = ref(0)

        console.log(counter)        // { value: 0 }
        console.log(counter.value)  // 0

        counter.value++
        console.log(counter.value)  // 1
        
        return {
            counter
        }
    }
}
```

### reactive 函数

reactive 函数为对象类型（包括数组）创建一个响应式引用，参数不可为基本类型。

## setup 内注册生命周期钩子

Composition API 的生命周期钩子与 Options API 名称相同，但需加 on 前缀，参数为回调函数。

另，生命周期 beforeDestroy、destroyed 被移除，用 beforeUnmount、unmounted 替代。

```javascript
import { fetchUserRepositories } from '@/api/repositories'
import { ref, onMounted } from 'vue'

// 在我们的组件中
setup (props) {
  const repositories = ref([])
  const getUserRepositories = async () => {
    repositories.value = await fetchUserRepositories(props.user)
  }

  onMounted(getUserRepositories) // 在 `mounted` 时调用 `getUserRepositories`

  return {
    repositories,
    getUserRepositories
  }
}
```

## watch 函数

watch 函数接受 3 个参数：

- 一个想要侦听的响应式引用或 getter 函数；（监听多个源，放入数组）
- 一个回调；
- 可选的配置选项。

```javascript
import { ref, watch } from 'vue'

const counter = ref(0)
watch(counter, (newValue, oldValue) => {
  console.log('The new counter value is: ' + counter.value)
})
```

## computed 函数

默认配置 getter，可指定配置 setter：

```javascript
import { ref, computed } from 'vue'

const counter = ref(0)
const twiceTheCounter = computed(() => counter.value * 2)

counter.value++
console.log(counter.value)          // 1
console.log(twiceTheCounter.value)  // 2
```

## provide/inject

provide 函数有两个参数定义属性：

- name（String 类型） 
- value

```javascript
import { provide } from 'vue'
setup() {
    provide('location', 'North Pole')
    provide('geolocation', {
        longitude: 90,
        latitude: 135
    })
}
```

inject 函数有两个参数：

- 要注入的属性名（String 类型） 
- 默认值（可选）

```javascript
import { inject } from 'vue'
setup() {
    const userLocation = inject('location', 'The Universe')
    const userGeolocation = inject('geolocation')

    return {
        userLocation,
        userGeolocation
    }
}
```

**父组件到后代组件的响应式实现，需在 provide 时将数据转换成响应式引用。**

后代组件要修改属性，需在父组件中定义修改函数 provide/inject 给后代组件。若禁止后代组件修改，可在父组件 provide 时使用 readonly 函数包装响应式引用。

## 单文件组件 \<script setup>

```javascript
<script setup lang="ts">
// code here
</script>
```

上述代码会被编译成组件 setup 函数的内容，这意味着与普通的 \<script> 只在组件被首次引入的时候执行一次不同，\<script setup> 中的代码会在**每次组件实例被创建的时候执行**。

\<script setup> 特性：

- 顶层的绑定会暴露给模板，包括变量、函数以及 import 的内容；
- 响应式 APIs 创建的响应式状态，模板中使用 ref 值默认解包；
- \<script setup> 中的值能被作为自定义组件的标签名使用，模板中驼峰和 kebab-case 两种形式均可使用；
- 支持动态组件、递归组件和命名空间组件；
- 可直接使用 defineProps、defineEmits 和 defineExpose；
- 可搭配 \<script> 同时使用；
- 顶层可使用 await，setup 将被添加 async 声明；
- 如果使用 TypeScript，props 和 emits 都可以使用传递字面量类型的纯类型语法做为参数给 defineProps 和 defineEmits 来声明：

```typescript
const props = defineProps<{
  foo: string
  bar?: number
}>()

const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()
```
