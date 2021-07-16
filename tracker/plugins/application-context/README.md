# Objectiv ApplicationContext Plugin
Generates and pushes an `ApplicationContext` to each `TrackerEvent`'s `global_contexts` during its `beforeTransport` phase.  

### ApplicationContext
```typescript
{
  _context_type: 'ApplicationContext';
  id: string;
}
```

---

# Installing
To install the most recent stable version:

### yarn
```sh
yarn add @objectiv/plugin-application-context
```

### npm
```sh
npm install @objectiv/plugin-application-context
```

# Usage
[PLACEHOLDER: Refer to DOCS on how to initialize / extend Tracker Plugins]
