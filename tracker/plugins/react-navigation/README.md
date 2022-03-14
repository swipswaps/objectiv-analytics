# Objectiv React Navigation Native Tracked Components

This package aims at automatically tracking React Navigation v6+ components and state. In includes: 
- `ContextsFromReactNavigationPlugin` to automatically infer RootLocation and Path Context from navigation root state.
- `TrackedLink`, automatically tracked `Link` component.

---
## Package Installation
To install the most recent stable version:

```sh
yarn add @objectiv/plugin-react-navigation
```

### or
```sh
npm install @objectiv/plugin-react-navigation
```

## Plugin usage
```tsx
import { ContextsFromReactNavigationPlugin } from "@objectiv/plugin-react-navigation";
import { ObjectivProvider, ReactNativeTracker } from "@objectiv/tracker-react-native";

const navigationContainerRef = useNavigationContainerRef();

const tracker = new ReactNativeTracker({
  applicationId: APP_ID,
  endpoint: COLLECTOR_ENDPOINT,
  plugins: [
    new ContextsFromReactNavigationPlugin({ navigationContainerRef })
  ]
})

return (
  <NavigationContainer ref={navigationContainerRef}>
    <ObjectivProvider tracker={tracker}>
      // ...
    </ObjectivProvider>
  </NavigationContainer>
);
```

## TrackedLink usage
TrackedLinks have the same props of regular Links.  

```tsx
import { TrackedLink } from "@objectiv/plugin-react-navigation";

// LinkContext identifier is automatically inferred from the child Text
<TrackedLink to="/HomeScreen">
  Home
</TrackedLink>

<TrackedLink to={{ screen: 'Profile', params: { id: 123 } }}>
  Profile
</TrackedLink>


// When that is not possible, a LinkContext identifier can be specified via the `id` prop 
<TrackedLink to="/HomeScreen" id={'home'}>
  🏡
</TrackedLink>
```

# Copyright and license
Licensed and distributed under the Apache 2.0 License (An OSI Approved License).

Copyright (c) 2022 Objectiv B.V.

All rights reserved.
