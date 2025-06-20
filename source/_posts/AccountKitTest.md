---
title: 华为账户一键登录功能测试
date: 2025-05-14 11:10:51
tags:
  - 鸿蒙
  - 技术向
  - V2
  - 华为账户登录
description: Account Kit的官方demo测试与华为账户登录的功能实现分析。
cover: /img/ArticleTopImgs/AccountTopImg.png
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

本篇文章会作为[鸿小易](https://xbxyftx.top/2025/03/31/%E2%80%9Chongxiaoyi%E2%80%9D/)的华为账号登录功能实现的功能测试先导文章，会先将华为官方提供的华为账号登录demo运行出来并对其功能进行拆解分析，最后回到鸿小易中进行功能的实现。

## 基础概念

首先在开始之前要先明确一下我们能从`Account Kit`中获取到的各个字段的含义。

| 名称 | 描述 |
| ---- | ---- |
| OpenID | 应用维度用户标识符，是华为账号用户在应用/元服务的唯一标识。不同应用/元服务（不管是否在同一个开发者账号下）获取到用户的信息不同 |
| UnionID | 开发者维度用户标识符，华为账号用户同一开发者账号下的唯一标识。开发者有多个应用/元服务时，同一个开发者账号下的应用/元服务获取到的UnionID相同 |
| permission | 数据或接口权限，通过该权限判断应用是否能获取对应数据或调用对应接口 |
| scopes | scope列表，用于获取用户数据。开发者向华为账号服务申请不同类型用户数据的标识。比如头像昵称（profile）、手机号（phone）等 |
| Authorization Code | 授权码，用户使用华为账号登录成功之后，可通过返回的凭据解析出授权码，通过授权码可获取Access Token、Refresh Token、ID Token等 |
| Access Token | 访问凭证，是访问被权限管控资源的应用级凭证。可使用Access Token调用获取用户信息接口获取用户信息 |
| ID Token | 用户身份凭证，是OIDC (OpenID Connect) 协议相对于OAuth 2.0 协议扩展的一个用户身份凭证，包含用户信息。用户使用华为账号登录成功之后，可通过返回的凭据解析出Authorization Code、ID Token、OpenID、UnionID等数据 | 