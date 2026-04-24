# Alkimia — Patterns

Vanilla JavaScript components and their playgrounds. Each component is a single file, zero framework dependencies, built with factory functions and closures.

This is the source code behind [alkimia-framework.io](https://alkimia-framework.io).

---

## Components

### Services
| Component | Description |
|---|---|
| **Router** | SPA router with nav, page lifecycle, groups, address bar control |
| **StorageService** | Namespaced sessionStorage/localStorage wrapper |
| **LocalisationService** | Language selector, DOM scanning, onChange events |
| **IconService** | SVG icon-set loader, extracts icons by ID, forces currentColor |
| **AuthenticationService** | Login, register, 2FA/TOTP flow — requires server |

### Widgets
| Component | Description |
|---|---|
| **Input** | Text, email, password with validators and inline issues |
| **DataTable** | Sort, filter, paginate, inline editing drawer — requires server |

---

## Running the playgrounds

Each component has a `playground/` folder with a working example.

Most playgrounds are self-contained. **AuthenticationService** and **DataTable** need a backend server for API calls.

### Start the server (Docker)

```bash
docker compose up --build
```

This starts a Node.js mock server on `http://localhost:3000` with:
- `/api/auth/*` — login, register, 2FA with real TOTP
- `/api/users/*` — 1000 generated users (list, create, update, delete)

### Run a playground

From the component folder:

```bash
npm run <component-name>-playground
```

For example:

```bash
cd components/widgets/DataTable
npm run data-table-playground
```

The playground dev server proxies `/api` requests to the Docker server automatically.

---

## Pattern

Every component follows the same shape:

```js
export default function ComponentName(_params) {
    const instance = Object.create(ComponentName.prototype);
    const { dependency } = transfer(_params, { dependency: null });

    // private state — closures
    let _count = 0;

    function _init() {
        // setup
        return instance;
    }

    // public API — explicit
    instance.getCount = function() { return _count; };

    return _init();
}
```

No classes. No `new`. No `this` for state. Copy a file, it works.

---

[alkimia-framework.io](https://alkimia-framework.io) · © InterSides
