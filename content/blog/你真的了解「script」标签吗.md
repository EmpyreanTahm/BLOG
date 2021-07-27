---
title: "你真的了解 script 标签吗"
author: "GeeKery"
date: 2020-06-26T03:35:39+08:00
image: "images/head_two.jpg"
categories: ["HTML", "ECMAScript"]
---

## crossorigin 属性

crossorigin 值有 anonymous 和 use-credentials，空值如 crossorigin 或 crossorigin="" 缺省为 anonymous，如果未指定此属性，CORS 将不会启用，若启用必须保证**服务器已开启跨域请求允许**。其他 HTML5 元素如 \<audio>、\<video>、\<link>、\<img> 等均有跨域属性。

anonymous 值表示对此元素的 CORS 请求将不设置凭据标志；use-credentials 表示对此元素的 CORS 请求将设置凭证标志，这意味着请求将提供凭据。换句话说，就是 use-credentials 允许浏览器携带 Cookie 等凭证数据到服务器，而 anonymous 不允许。

请求 CDN 等内容可指定为 anonymous，在获取需要用户凭证的内容如 manifest 时，属性就必须(即使同源也要设置）设置为 use-credentials，Google 搜索首页的案例如下：

```html
<link href="/manifest?pwa=webhp" crossorigin="use-credentials" rel="manifest">
```

## integrity 属性

integrity 属性的值是经 base64 编码过后的文件哈希值，用于确认**脚本或样式表**内容未经篡改，防止遭遇 CDN 被入侵或中间人攻击引发的安全问题。integrity 可有多个哈希值，只要文件匹配其中任意一个哈希值，就可以通过校验并加载。在许多 CDN 上，提供了拷贝「HTML + SRI」的功能，就是在引用资源的 integrity 属性上携带了 CDN 服务器生成的哈希值，SRI 即子资源完整性（Subresource Integrity）。

integrity 值共两个部分：第一部分指定哈希值的生成算法（目前支持 sha256、sha384 及 sha512）；第二部分是经过 base64 编码的实际哈希值，两者之间通过一个短横（-）分割。可以通过 openssl 或者 shasum 生成 SRI 哈希值，在服务器或 CDN 中，可强制脚本或样式表必须通过 integrity 携带哈希值检验资源完整性，若未携带或值错误，内容将不会被加载，在安全性要求较高的项目可采取这种方式增加可靠性。实际生成的哈希值如下：

```html
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.20/lodash.min.js" 
        integrity="sha256-ur/YlHMU96MxHEsy3fHGszZHas7NzH4RQlD4tDVvFhw=" 
        crossorigin="anonymous"></script>
```

## type 属性

type 属性用于代替旧有非标准属性 language，用以表示代码块中脚本语言的 MIME 类型。type 属性支持的 MIME 类型有：text/javascript、text/ecmascript、application/javascript 和 application/ecmascript。HTML5 中的缺省值为 text/javascript。

若 MIME 类型不是上述支持的类型，则元素所包含内容会被当做数据块而不被执行。当 type 属性值为 module 时，代码会被当做 ES6+ 模块，此时代码中方可出现 import 和 export 关键字。

## nomodule 属性

当浏览器不支持 type="module"  时，用 `<script nomodule src="..."></script>` 将打包的脚本作为备选进行执行，同时在支持 type="module"  的浏览器中将不会执行。

## src 引用外部脚本文件

引用外部文件被认为是比使用行内代码更佳的做法，理由是引用外部文件，在可维护性，缓存和适应未来等方面有更大的优势。可能是受到曾风靡一时的雪碧图的影响，许多开发人员偏爱将某一页面引用的全部脚本打包成一个脚本文件，用以避免多次创建 HTTP 请求造成的延迟和性能消耗。

随着曾经 SPDY（speedy，Google 最早提出的通过压缩、多路复用和优先级缩短网页加载时间的协议，15 年 9 月，Google 宣布移除对 SPDY 的支持）的过渡和如今 HTTP/2 的普及，适当拆分既不会降低传输效率，也能最大程度使用浏览器的缓存能力。

## async 与 defer 属性

当浏览器解析到 \<script> 元素时，若没有 async 或是 defer 属性，浏览器将立即下载脚本并执行，下载和执行期间，后续解析被阻塞。

当 \<script> 元素有 async 或 defer 属性时，浏览器将立即下载脚本，后续解析如下：
- 当属性为 async 时，脚本下载完后就会停止解析，并立即执行已下载的异步脚本。
- 当属性为 defer 时，脚本下载完成后将等待所有元素解析完成之后，DOMContentLoaded 事件之前完成，若有多个延迟脚本将按顺序执行（高程三、四均表示执行顺序仅理论如此，实际不确定，保证页面至多一个 defer 脚本是最佳实践）。

当初始的 HTML 文档被完全加载和解析完成之后，DOMContentLoaded 事件被触发，而无需等待样式表、图像和子框架的完全加载。async、defer 和普通渲染流程示意如下：

![async_defer](/你真的了解script标签吗/async_defer.png)

## 动态导入脚本文件

``` js
const script = document.createElement('script')
script.src = 'lodash.js'
// script.async = false
document.head.appendChild(script)
```

脚本通过上述方式动态加载时，会**异步加载**，相当于添加了 async 属性。若需按照加载的顺序执行，要将 async 属性设置为 false。
