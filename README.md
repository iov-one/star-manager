# Starname Manager

[![Docker Pulls](https://img.shields.io/docker/pulls/iov1/bierzo-wallet.svg)](https://hub.docker.com/r/iov1/bierzo-wallet/)

This is a manager for starnames. It will allow users to,

- Create new starnames
- Create names for given domains
- Create names for \*iov (or iovnames)
- Manage addresses linked to given names

## Building

### Installing Dependencies
This project contains simultaneously the UI application which is a React application and a few firebase cloud functions.
The whole project can be built with the following procedure,

```
npm run install:all
```

this will execute `npm install` in the current directory as well as install packages to the `application/` and `functions/` directories.

**NOTE THAT YOU CANNOT USE `npm install` or `yarn install` BECAUSE THIS WOULD ONLY INSTALL PACAKGES IN THE LOCAL DIRECTORY AND NOT INSIDE THE OTHER PROJECTS**

### Compiling

To compile both projects run,

```
npm run build
```

this will compile the React application and the Cloud Functions from typescript to javascript.

### Testing

To execute all tests we can run

```
npm test
```

### Linter

To execute eslint with the project configuration and defaults just do

```
npm run lint
```

## Starname for GDrive Users
The Starname manager includes the ability to create a new account from your google account. The procedure to do so is quite simple and completely transparent for the user and the code as well.

We use our own [GDrive Custodian](https://github.com/iov-one/gmail-signer) library.

This library uses two sandboxed iframes to securely access the private key.

## Wallet Connect Integration

Wallet Connect lets us grab someones address from a mobile wallet into the starname manager for ease of use and to help avoid errors, it also greatly simplifies the process of editing starnames.

Wallet Connect however needs some special tricks to allow a multichain address to send all the addresses to the manager.

In order to do so, the wallet has to comply with 2 things.

1. It must ensure that the application url (`peerMeta.url`) matches _https://starname.me_
2. Given that (1) is satisfied, to send all the desired addresses your wallet has to send a json with the following structure

```
{
  "type": "starname",
  "addresses": [{
    "ticker": TICKER1,
    "address": address1
  }, {
    "ticker": [TICKER2],
    "address": address2
  },
	.
	.
	.
  {
    "ticker": [TICKERn],
    "address": addressN
  }],
}
```

As concrete example would look like this

```
{
 "type": "starname",
 "addresses": [{
    "ticker": "ETH",
    "address": "0x795997519227f64879977d1a53625707f29b25b2"
  }, {
    "ticker": "BTC",
    "address": "14AcAvkYz9eUP226NpGvTf62uP4Du2NnZJ"
  }]
}
```

This json must be sent as the first element of the array that makes the standard payload of a Wallet Connect session message. It needs to be converted to a string as with `JSON.stringify()` for example. This is required because Wallet Connect actually shares an array of strings.

You can also send regular Wallet Connect payloads.
