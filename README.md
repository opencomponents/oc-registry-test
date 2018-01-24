oc-registry-test
================

An utility to test an [OpenComponents](https://github.com/opentable/oc) Registry is setup and secured correctly

[![npm version](https://img.shields.io/npm/v/oc-registry-test.svg)](https://npmjs.org/package/oc-registry-test)

### Install

```sh
$ [sudo] npm i -g oc-registry-test
```

### Usage

```sh
$ oc-registry-test https://my-oc-registry.com
```

#### Options

By default the registry is checked using _https_ protocol. 

`--http` - to check a registry with both _http_ and _https_ protocol.

`--httponly` - to check a registry only with _http_. 


If both options are specified at the same time only http will be checked. 

Example usage to only check registry using http:

```
oc-registry-test --httponly http://my-oc-registry.com
```



### License
MIT
