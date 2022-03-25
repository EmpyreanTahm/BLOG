---
title: "物尽其用「npx」"
author: "GeekKery"
date: 2020-05-13T02:12:21+08:00
tags: ["npx"]
---

npx 是跟随 npm\@5.2.0 版本一起发布的，安装 5.2.0 版本及之后的 npm ，会自动安装 npx。npx 可以认为是「NPM Package Executor」的缩写，它为 npm 包管理和执行提供辅助功能。

查看 npx 版本：

```bash
npx --version
```

如果 npm 版本低于 5.2.0 ，可以升级 npm 版本，或全局安装以使用 npx：

```bash
npm install -g npx
```

## 调用项目安装的模块

如果项目中安装了可执行的模块，在 node_modules/.bin 目录下会有相应的指令用于执行。例如，使用 Next.js 构建的项目在 node_modules/.bin 下会有 next 命令，可以通过以下方式调用：

命令行调用：

```bash
node node_modules/.bin/next -v
```

npx 调用：
```bash
npx next -v
```

**npx 会自动在 node_modules/.bin 路径和环境变量 $PATH 进行执行文件定位，如果查找成功，直接执行。如果查找失败，会临时下载对应模块的运行程序到一个临时目录，使用以后再删除，以后再次执行相同的命令，会重新下载。**

运行 `npx ls`，由于环境变量中有 ls 命令，因此会立即执行：

![npx_ls](/物尽其用「npx」/npx_ls.png)

## 避免全局安装模块

npx 可以避免全局安装模块，例如在某个目录下需要启动 web 服务，可以使用 npx 运行包 http-server：

```bash
npx http-server
```

执行成功后，http-server 默认代理执行命令所在路径下的文件。退出执行，http-server 会被自动清除，下次运行时会重新下载并执行。 

前端的 CLI 工具如 create-react-app 和 vue-cli 等，在生成模板项目时，不再需要卸载旧版本的全局包，再安装最新版本：

```bash
npx create-react-app demo
npx -p @vue/cli vue create demo
```

## 执行远程模块

npx 可以从 URL 执行程序包，前提是 URL 上的远程代码必须是一个规范的 Node.js 模块，即必须包含 package.json 文件和入口脚本，并确认模块安全。比如用 Github Gist 存放的 Node.js 脚本，可以用 npx 执行，Github Gist 中的内容：

![gist_script](/物尽其用「npx」/gist_script.png)

本地执行如下 :

![run_gist_script](/物尽其用「npx」/run_gist_script.png)

## 切换 Node.js 版本

利用 npx 可以下载模块的特点，可以指定具体版本的 Node.js 运行脚本：

```bash
npx node@0.12.8 -v
```

上面命令会使用 0.12.8 版本的 Node.js 执行，利用 npm 下载这个版本的 Node.js，使用后再删除。某些场景下，这种切换 Node.js 版本的方式相对简洁。

## 常用参数

### \--no-install

如果想让 npx 强制使用本地模块，不下载远程模块，可以添加 --no-install 参数。如果本地不存在该模块，就会报错。

```bash
npx --no-install http-server
```

### \--ignore-existing

反过来，如果要忽略本地的同名模块，强制安装使用远程模块，可以使用 --ignore-existing 参数。比如，本地已经全局安装了 create-react-app，但还是想使用远程模块，就可以使用这个参数。

```bash
npx --ignore-existing create-react-app react-app
```

### -p

**-p 参数用于指定 npx 所要安装的模块，并添加到正在运行的环境变量 $PATH。** 所以之前切换 Node.js 版本的命令可以写成下面这样。

```bash
npx -p node@0.12.8 node -v 
```

## 最后

npx 是用于执行 npm 包（包括 npm 官方包或符合规范的远程模块）的工具，使开发者使用 CLI 工具和被托管的可执行文件更方便，让交互式调用本地二进制文件更自由，提升了项目开发管理的效率。
