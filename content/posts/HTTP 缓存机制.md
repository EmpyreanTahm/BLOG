---
title: "HTTP 缓存机制"
author: "GeekKery"
date: 2021-01-09T12:26:02+08:00
tags: ["HTTP"]
---

HTTP 缓存通过资源复用，可以减轻服务器负担，显著提高网站和应用程序的性能。HTTP 缓存主要有客户端缓存和代理缓存，其它还包括网关缓存、CDN、反向代理缓存和负载均衡器等部署在服务器上的缓存方式。HTTP 缓存主要存储 GET 响应。

以 Chrome 为例，打开新标签页后调出 DevTools，将功能切至 NetWork，首次访问  Google 搜索页面，能看到请求：

![google_first_time](/HTTP缓存机制/google_first_time.png)

`ctrl + r` 刷新页面，可看到请求：

![google_next_time](/HTTP缓存机制/google_next_time.png)

在 Size 一栏中，可以看到部分资源来自 Memory Cache，部分来自 Disk Cache，其余从服务器获取。在首次访问页面之后，浏览器会将资源缓存，后续访问这些资源时，可直接从缓存中获取，不必再从服务器下载。

根据是否需要重新向服务器发起请求来分类，可以将 HTTP 缓存分为两类：强缓存和协商缓存。强缓存如果生效，不需要再和服务器发生交互，而协商缓存不管是否生效，都需要与服务端发生交互。**强缓存的优先级高于协商缓存**。

## 强缓存

强缓存指首次向服务器发起资源请求后，服务器会告知客户端资源缓存的有效时间，有效期内直接从客户端缓存中读取，不必与服务器交互。强缓存通过 Expires 和 Cache-Control 首部字段来实现，**后者优先级更高**。

### Expires

HTTP/1.0 定义了 Expires 响应首部字段，用于告知客户端资源缓存的过期时间，在过期时间之前请求资源直接使用缓存，不需要再次请求服务器（排除其它首部字段干扰的情况下）。

```http
Expires: Mon, 25 Jan 2021 23:04:06 GMT
```

Expires 过期时间由服务器生成，是否过期的判定最终需要参考客户端时间。客户端和服务器时间可能不一致，而且客户端的时间是可以自行修改的，修改客户端时间可能导致缓存失效（如浏览器时间参考操作系统时间，修改系统时间会影响到缓存），所以不一定满足预期。

### Cache-Control

为弥补 Expires 的缺点，HTTP/1.1 新增了 Cache-Control 通用首部字段，时间值为相对时间，且**不依赖客户端时间**，优先级高于 Expires。

| 指令               | 类型 | 说明                                                         |
| ------------------ | :--- | ------------------------------------------------------------ |
| no-cache           | 通用 | 资源正常缓存，但使用前必须进行协商校验                                     |
| no-store           | 通用 | 禁用所有缓存，从源服务器获取资源                                                 |
| public             | 响应 | 共享缓存（中间代理和 CDN等）和私有缓存（客户端）都可以缓存响应，缺省值为 private |
| private            | 响应 | 只有私有缓存可以缓存响应                                     |
| max-age = N        | 响应 | 缓存有效期（单位秒），为 0 时与 no-cache 效果一致            |
| s-maxage = N       | 响应 | 覆盖 max-age，只适用于共享缓存，私有缓存会忽略               |
| must-revalidation  | 响应 | 在缓存过期前可以使用，过期（如缓存时间超过 max-age）后必须向服务器验证 |
| proxy-revalidation | 响应 | 与 must-revalidate 作用相同，但仅适用于共享缓存，私有缓存会忽略。 |
| no-transform       | 通用 | 代理不可更改媒体类型如 Content-Encoding、Content-Range、Content-Type |


对于那些改动频率极低的资源如 CSS 或 JS 库，常见的做法是将 max-age 的值设为 31536000，代表一年内缓存有效。如果在缓存有效期内，内容资源内容发生了改动，可以修改资源名称，如在资源名称中加版本号或生成随机 hash。

### Pragma

Pragma 是 HTTP/1.0 标准中定义的一个首部字段，Pragma 只有一个值 no-cache，效果跟 `Cache-Control: no-cache` 效果相同，请求中一般会额外添加 Pragma 以兼容基于 HTTP/1.0 的服务器。

```http
Cache-Control: no-cache
Pragma: no-cache
```

## 协商缓存

协商缓存是指在强缓存失效后，客户端携带缓存标识向服务器发起请求，由服务器根据缓存标识来决定是否使用缓存，缓存有效返回 304 Not Modified，否则返回响应内容。协商缓存使用 「Last-Modified/If-Modified-Since」和「ETag/If-None-Match」两对首部字段作为标识确定缓存是否有效，**后者优先级更高**。

### Last-Modified

客户端首次访问资源时，服务器返回首部字段 Last-Modified 表明资源在服务器最近修改的时间，客户端在后续请求资源时会将这个时间放在请求首部的 If-Modified-Since 中。服务器收到这个请求，会对比 If-Modified-Since 和服务器上这个资源的最后修改时间：如果一致就返回 304 Not Modified，让客户端直接从缓存里读取；如果 If-Modified-Since 的时间小于服务器中这个资源的最后修改时间，说明文件有新的编辑，缓存失效，返回新的资源文件。

### Etag

客户端首次访问资源时，服务器返回首部字段 Etag，Etag 是服务器响应请求时，返回当前资源文件的一个唯一标识，客户端在后续请求此资源的时会将 Etag 值放在请求首部的 If-None-Match 中。服务器收到这个请求，会对比 If-None-Match 和服务器上这个资源的 Etag：如果一致就返回 304 Not Modified，让客户端直接从缓存里读取；否则说明文件内容有更新，缓存失效，返回新的资源文件。

Etag 的值为 W/ 开头时，说明使用的是弱 Etag。弱 Etag 匹配只要求两个资源在语义上相等，强 Etag 匹配要求其它实体字段如 Content-Language 也要一致。

若资源是分布式服务器（如 CDN）存储的情况，需要这些服务器上计算 ETag 的算法保持一致，才不会导致同一个文件，多台服务器返回的 ETag 却不一样。

#### If-Unmodified-Since 和 If-Match

这两个请求首部字段与缓存关系不大，If-Unmodified-Since 条件请求是只有当资源在指定的时间之后没有修改的情况下，服务器才会返回请求的资源，或是接受 POST 或其它 non-safe 方法的请求。如果所请求的资源在指定的时间之后发生了修改，那么会返回 412 Precondition Failed 错误。

If-Match 条件请求在请求方法为 GET 和 HEAD 的情况下，服务器仅在请求的资源满足此首部列出的 ETag 值时才会返回资源。而对于 PUT 或其它非安全方法来说，只有在满足条件的情况下才可以将资源上传。

## 浏览器缓存

前面提到的强缓存和协商缓存根本上来说是缓存策略，资源具体的缓存位置实际只有内存和磁盘，在浏览器中包括非持久化的 Memory Cache、Push Cache 和持久化的 Disk Cache、Service Worker 共四类缓存。

Memory Cache 有效时间不超过 Tab 的存活周期，Tab 被关闭时释放，具体释放时机取决于浏览器策略。Memory Cache 会忽略 Cache-Control 被标记为 max-age=0 或 no-cache 的情况，此时资源仍可被放入 Memory Cache ，当值为 no-store 时，才不会被放入 Memory Cache。

Memory Cache 使得页面中的同一地址资源只需要进行一次请求，但当请求类型不同时，不会使用 Memory Cache，如脚本和样式表使用同一地址资源，会进行两次请求。预加载资源一般也存放在 Memory Cache 中。

Service Worker 是运行在浏览器中的独立线程，可实现离线缓存、消息推送和网络代理等功能，而 Push Cache 是 HTTP/2 中的新内容。

浏览器缓存调用的优先关系是：Memory Cache > Service Worker >  Disk Cache > Push Cache，若在以上四个缓存中均未找到有效的缓存资源，将对服务器发起资源的请求。

### AJAX 和 Fetch

Ajax 和 Fetch 中的 Get 请求通常会被用作等幂操作，前面讨论的 HTTP 缓存机制依然适用。

### 用户行为
用户行为对浏览器缓存的影响有以下几种（仅讨论 Memory Cache 和 Disk Cache）：

- Tab 输入 URI 回车：先检测强缓存是否有效，有效则从 Disk Cache 获取资源；强缓存无效则发送请求协商，若协商缓存有效服务器返回 304 状态码，浏览器依旧从 Disk Cache 获取资源；协商缓存也无效时，服务器会返回资源内容主体。
- 普通刷新：首先查看 Memory Cache 是否有效，有效直接从 Memory Cache 获取资源；无效则按「Tab 输入 URI 回车」步骤执行。
- 强制刷新：浏览器不使用任何本地缓存而直接发送请求，头部带有 `Cache-Control: no-cache` 和 `Pragma: no-cache`，并且**不会在请求中携带协商缓存字段**。
- DevTools 选中 Disable Cache：效果与「强制刷新」一样

以上使用强制刷新，只是代表浏览器不使用任何本地缓存，但代理缓存依旧可能生效。

## 其它缓存首部字段

### Date

Date 通用首部包含了报文创建的日期和时间。Date 在响应中说明响应生成的时间，请求经过代理服务器时, 返回的 Date 未必是最新的，通常这个时候，代理服务器将增加一个 Age 字段告知该资源已缓存了多久。

### Age

Age 响应首部字段里包含资源在缓存代理中存贮的时长，单位为秒。

```http
Age: 40152
Date: Fri, 05 Feb 2021 16:58:00 GMT
```

以上响应意为代理服务器在 2021 年 2 月 5 日 16:58:00 时向源服务器发起了对该资源的请求，目前已缓存了该资源 741427 秒。

### Vary

通过 Vary 响应首部字段，源服务器会向代理服务器传达关于本地缓存使用方法的指令。代理服务器接收到源服务器包含 Vary 的响应后，缓存对应资源，后续仅对 **Vary 值属性一样的请求**返回此缓存。即使对相同资源发起请求，但由于 Vary 指定的首部字段不相同，因此必须要从源服务器重新获取资源。

举例来说，同一 URL 的资源，根据客户端 Accept-Language 值的不同，需要内容不同的资源文件。中文客户端用户请求资源后，代理服务器进行了缓存：如果没有指定 `Vary: Accept-Language`，那么后续所有客户端将只能使用这份中文内容的缓存；如果指定 `Vary: Accept-Language`，那么只有中文客户端才会使用代理服务器的这份缓存。

```http
Vary: Accept-Encoding, Accept-Language, User-Agent
```

如上设置，代理服务器将根据客户端支持的编码类型、自然语言和用户代理（如 PC、Android、iOS 等）三个方面去缓存资源。如此，同一路径的资源，就能针对这三者的不同，返回对应的缓存内容，避免返回同一缓存。

