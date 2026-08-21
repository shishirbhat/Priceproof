# Running the app locally

## Quick start

```bash
nvm use            # or: nvm install 22
npm run setup      # installs frontend dependencies
npm run dev
```

Then open **http://localhost:5173/welcome**

These scripts work from the repository root *or* from `frontend/` — the
root ones delegate. There is no need to `cd` anywhere first.

## Routes

| URL | What it is | Needs the backend? |
|---|---|---|
| `/welcome` | The front door. Start here. | No |
| `/racing` | Standalone showroom build | No |
| `/` | Intelligence dashboard | Yes — empty without it |
| `/welcome/classic` | Original marketing landing | No |

## If it does not load

**"Missing script: dev" / ENOENT**
You are in a directory with no `package.json`. Both the repository root
and `frontend/` work; anywhere else does not.

**The server exits immediately, or an unhelpful syntax error**
Node is too old. Vite 8 needs `^20.19.0` or `>=22.12.0`, and note that the
whole 21.x line is unsupported. `npm run dev` checks this first and tells
you outright. Fix with `nvm install 22 && nvm use 22`.

**"Connection refused" in the browser, but the terminal looks fine**
Read the port Vite actually printed. If 5173 was busy it will have moved
to 5174 or beyond rather than failing.

If you are in WSL2, a VM, a devcontainer or Docker, use the **Network**
address Vite prints, not `localhost` — the dev server binds all
interfaces for exactly this reason, but the host browser still has to be
pointed at the right one.

**A blank white page, server running**
A runtime error. Open the browser console — that message is the actual
problem, and it is worth pasting verbatim.

**The dashboard renders but every card is empty**
Expected without the backend. The `/api` calls have nothing to talk to.
`/welcome` and `/racing` are unaffected.

## Adding car photography

Drop images into `frontend/src/assets/cars/<id>/` and restart. Two or more
images in a folder become a drag-scrubbable 360° turntable; one becomes a
still; empty falls back to generated geometry. Folder ids and the rest of
the convention are documented in `frontend/src/assets/cars/README.md`.
