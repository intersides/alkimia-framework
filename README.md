# Alkimia — Patterns

Vanilla JavaScript components and their playgrounds. Each component is a single file, zero framework dependencies, built with factory functions and closures.

This is the source code behind [alkimia-framework.io](https://alkimia-framework.io).

---

## Components

### Services
| Component | Description |
|---|---|
| **AuthenticationService** | Login, register, 2FA/TOTP flow |
| **EventService** | Pub/sub event bus for cross-component communication |
| **IconService** | SVG icon-set loader, extracts icons by ID |
| **LocalisationService** | Language selector, DOM scanning, onChange events |
| **Router** | SPA router with nav, page lifecycle, groups, address bar control |
| **StorageService** | Namespaced sessionStorage/localStorage wrapper |

### Widgets
| Component | Description |
|---|---|
| **AutocompleteInput** | Text input with filterable dropdown list, keyboard navigation |
| **DataTable** | Sort, filter, paginate, inline editing drawer, actions column |
| **Dialog** | Modal dialog wrapping native `<dialog>`, size presets, backdrop dismiss |
| **Input** | Text, email, password with validators and inline issues |
| **Menu** | Dropdown menu with nested submenus, expandable sections, keyboard navigation |
| **Notifier** | Notification stack with positioning, animation, alert levels |
| **Tabs** | Tab bar with lazy content loading, persistent state |
| **Tooltip** | Singleton tooltip, attaches to any element, auto-flip positioning |

### Utilities
| Component | Description |
|---|---|
| **ElementState** | Proxy-based reactive DOM binding, one value drives many elements |
| **transfer()** | Parameter defaults, dependency injection, config merging (~15 lines) |

---

## Running the playgrounds

Each component has a `playground/` folder with a working example.

Most playgrounds are self-contained. **AuthenticationService** and **DataTable** need a backend server for API calls.

### Start the server (Docker)

```bash
cd mock-server
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

---

This code is provided for reference. No license is granted for reuse or redistribution.

[alkimia-framework.io](https://alkimia-framework.io) · © InterSides
