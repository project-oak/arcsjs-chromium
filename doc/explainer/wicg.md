# WICG Incubator:  Policy Protected Data Access for Untrusted Components

_cromwellian@, sjmiles@, wkorman@, seefeld@, mariakleiner@, sarahheimlich@ / Draft: 2022-07-25_


# Introduction

The Open Web’s potential to allow developers and users to dynamically compose software that operates on their data is limited today. One reason is due to growing concerns over security and privacy. There still exists a huge need for users to run third party code on their personal data, as well as to extend existing applications with third party functionality, i.e.  “plugins”, but current approaches either involve server-side mashups with REST apis, or rely on homespun plugin approaches with uncertain security for the user.

 \
Today, fingerprintable use cases are addressed on an ad-hoc basis and those and other uses of sensitive data overwhelm users with permission granting dialogs. Consider what things would be like if we had a standardized way to safely compose and execute untrusted third party code components with explicit control over user data input and output. We propose a system that would greatly reduce the fingerprint attack surface area available to websites while reducing user-fatigue due to permission granting. This has a number of use-cases including
* separating code that accesses fingerprintable data and limiting egress to the rest of the app (e.g. webgl rendering, adaptive rendering, etc.)
* customizable pickers (e.g. fonts, photos, devices) that blend into the web application, but without the need for permissions
* private extensions/plugins to apps (e.g. VSCode, Discord, Chrome, etc.) that might no longer need install steps and can be automatically and safely loaded by all users in a collaborative environment.

 \
The [proposal](https://github.com/project-oak/arcsjs-chromium/tree/main/doc/explainer) outlines how untrusted components can access private user data through policy protection and enforcement. This is achieved through three mechanisms:

* A policy language that defines restrictions for data usage. For example, this could enforce integrity and confidentiality requirements. 
* A secure execution environment that enforces the policy outlined above for untrusted components. A lightweight component specification provides for explicit control over data inputs and outputs allowing data flow analysis.
* A trusted UI composition layer that allows for untrusted components to co-exist in a UI without interfering with each other.
