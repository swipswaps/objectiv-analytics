# Objectiv JavaScript Tracker
[PLACEHOLDER: Objectiv Tracker introductory text]

## Tracker monorepo overview
The Objectiv JavaScript Tracker is composed of three module domains. 

- The **Core** module is a platform agnostic set of generic Interfaces and Classes.  
  More **Core** modules may be added in the future.  
  
  
- **Plugins** are independent packages that can be configured in any Tracker instance to add or mutate contextual information.  
  

- **Trackers** are platform specific extensions of the generic **Core** Tracker.  
  They offer a higher level, easier to configure and use, API and may be bundled with a sensible set of **Plugins** for their target environment.

>Note: Packages may be completely independent of each other. Currently, many of them share the same testing framework or bundler, but each has its own local configurations and may diverge if needed.

## Requirements

- git
- Node.js 10
- Yarn

## Getting started

Objectiv Tracker is a monorepo workspace residing in the `tracker` folder under the `objectiv-analytics` repository.

The monorepo is configured to allow for live development on any package without the need of building anything.

Both TypeScript and Jest have their module resolutions setup to map to the source files, regardless of the dependencies in package.json.

## Monorepo commands
For simplicity, we will assume that all commands are executed from within the `tracker` folder.

```bash
$ cd tracker
```

### Commands scope
By default, all commands will execute for each package. It's possible to execute a command for a single package without changing directory
```bash
yarn workspace <package name> <command>
```

For example this will run tests only for the Core module:
```bash
yarn workspace @objectiv/core test
```

This is also how to add and remove dependencies:
```bash
yarn workspace @objectiv/core add <packageA>
yarn workspace @objectiv/core add <packageB> --dev
yarn workspace @objectiv/core remove <packageA> <packageB>
```

## Commonly used commands

### `yarn list`
Prints a list of all the packages configured in the monorepo.

### `yarn install`
Install dependencies for all packages and links local packages to each other.

### `yarn prettier`
Runs prettier for all packages in write mode.

### `yarn lint`
Lints all packages.

### `yarn test`
Runs the tests for all packages.

### `yarn test:coverage`
Runs the tests for all packages and collects coverage.
Coverage output will be produced in a `/coverage` folder under each package.

### `yarn build`
Builds all packages.
Build output will be produced in a `/dist` folder under each package.
