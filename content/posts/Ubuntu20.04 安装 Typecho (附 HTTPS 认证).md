---
title: "Ubuntu20.04 安装 Typecho (附 HTTPS 认证)"
author: "GeekKery"
date: 2020-05-12T10:26:06+08:00
tags: ["Typecho"]
---

本文介绍在 Ubuntu20.04 系统中搭建 PHP、 MySQL 和 Nginx 集成环境，在此基础上安装 [Typecho](http://typecho.org) 并获取 HTTPS 认证。

首先，通过包管理器更新源并升级软件：

```bash
sudo apt-get update
sudo apt-get upgrade
```

## 安装 PHP 和相关扩展

数据库使用 MySQL，需要在 PHP 中安装扩展 php-mysql。与 Apache 不同，Nginx 没有内置对 PHP 文件的处理支持，因此需要使用 php-fpm 来处理 PHP 文件。

```bash
sudo apt-get -y install php php-mysql php-fpm
```

注意，在执行上面的命令后，系统会自动安装 Apache2，将其卸载：

```bash
sudo apt-get --purge remove apache2
```

## 安装配置 MySQL

```bash
sudo apt-get -y install mysql-server
```

执行 `sudo cat /etc/mysql/debian.cnf` 查看数据库初始化配置，找到 user 和 password 字段：

![mysql_pass.png](/Ubuntu20.04安装Typecho(附HTTPS认证)/mysql_password.png)

为方便后续配置和使用 MySQL，使用密码登录 MySQL 后配置 root 用户密码：

```bash
mysql -u debian-sys-maint -p
```

输入密码回车完成 MySQL 认证，接着在 MySQL 交互命令行中操作：

```sql 
use mysql;
-- 设置 MySQL 数据库 root 用户的密码
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '自定义 root 用户密码';
flush privileges;
exit
```

执行 `mysql -u root -p` ，输入刚才设置的新密码进行登录，登录后创建名为 typecho 数据库：

```sql
CREATE DATABASE typecho DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 安装配置 Nginx

```bash
sudo apt-get -y install nginx
```

安装 Nginx 后，在浏览器通过 IP 地址访问服务器，可以看到「Welcome to nginx!」的欢迎页面，表明 Nginx 已成功安装并启动。**将域名解析到服务器 IP 地址**，然后修改 Nginx 配置：

```bash
sudo vi /etc/nginx/sites-enabled/default
```

配置 Nginx 基本内容：

```nginx
server {
    server_name soupcraft.icu, www.soupcraft.icu;
    listen 80;
    root /var/www/html;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php$is_args$args;
    }

    location ~ \.php$ {
        include fastcgi.conf;
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php7.4-fpm.sock;
    }

}
```

保存文件后，执行 `sudo service nginx restart` 重启 Nginx，即可通过域名访问。

## 安装 Typecho

首先移动到之前 Nginx 配置的 root 属性路径下（root 属性可配置其它路径，保持一致即可）：

```bash
cd /var/www/html
```

复制 Typecho 的[下载页面](http://typecho.org/download)正式版的链接地址，在服务器进行压缩包下载并解压：

```bash
sudo wget http://typecho.org/downloads/1.1-17.10.30-release.tar.gz
sudo tar -zxvf 1.1-17.10.30-release.tar.gz
```

移动解压后的文件到 /var/www/html 路径下，并删除无关内容：

```bash
mv build/* ./
rm -r build
rm 1.1-17.10.30-release.tar.gz
```

通过域名进入网站 /install.php 页面，填写数据库配置、网站和个人信息，提交后，出现以下页面：

![database_config.png](/Ubuntu20.04安装Typecho(附HTTPS认证)/database_config.png)

复制框中的数据库配置内容，按照提示粘贴保存至 config.inc.php 文件中：

```bash
cd /var/www/html
sudo vi config.inc.php
```

保存退出后，切回浏览器点击「创建完毕，继续安装」按钮，完成后续安装。

### 权限

在安装和后续使用过程中，可能会多次出现对某个目录没有写入权限的问题：比如在管理外观时出现「此文件无法写入」的提示；scp 上传文件、插件或主题时被告知「Permission denied」等。使用 chmod 命令修改权限即可解决：

```bash
sudo chmod -R 777 /var/www/html/usr/
```

## 使用 Certbot 获取 SSL 证书

腾讯云的免费 SSL 证书申请始终处于验证状态，方便起见，用 [Certbot](https://certbot.eff.org/) 获取证书，选择服务软件为 Nginx，选择操作系统为 Ubuntu20.04 之后，会自动跳转[安装页面](https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx)，按照文档流程在服务器进行操作，由于 Ubuntu20.04 已经预安装了 snapd，直接开始以下步骤：

```bash
sudo snap install --classic certbot
sudo certbot --nginx
```

自动更新配置后，稍加修改，完整的 /etc/nginx/sites-enabled/default 文件配置内容如下：

```nginx
server {
    server_name soupcraft.icu, www.soupcraft.icu;
    listen 80;
    return 301 https://www.soupcraft.icu$request_uri;
}

server {
    server_name  www.soupcraft.icu;
    root /var/www/html;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php$is_args$args;
    }

    location ~ \.php$ {
        include fastcgi.conf;
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php7.4-fpm.sock;
    }
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/www.soupcraft.icu/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/www.soupcraft.icu/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```

打开 80 端口的域名，会被重定向到 443 端口，安装完成~
