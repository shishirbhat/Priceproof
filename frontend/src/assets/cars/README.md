# Car imagery

Drop photographs in here and the site picks them up on the next build. No
code changes, no manifest to edit.

## Layout

```
src/assets/cars/
  963/            frame-000.jpg, frame-001.jpg, …   → 360° turntable
  99x/            frame-000.jpg, …
  911-gt3-r/      hero.jpg                          → single still
  911-cup/
```

The folder name must match the car's `id` in
`src/components/racing/data.ts` (`963`, `99x`, `911-gt3-r`, `911-cup`) or
the segment's `id` in `src/components/welcome/segments.ts` (`hatchback`,
`sedan`, `suv`, `luxury`).

## How it resolves

- **Two or more images** in a folder → a drag-scrubbable turntable, played
  in filename order. Zero-pad the numbers (`frame-000`, not `frame-0`) so
  they sort correctly.
- **Exactly one image** → shown as a still against the studio backdrop.
- **Empty folder** → falls back to generated geometry.

Shoot or source frames at a constant camera height and a fixed angular
step; 24–36 frames is the usual range. Anything `<img>` can decode works —
`.jpg`, `.png`, `.webp`, `.avif`.

## Licensing

Only add images you have the right to publish. Manufacturer press and
studio photography is generally copyrighted and not licensed for reuse.
Nothing in this folder is redistributed with the repository by default.

## Marketing front door (`/welcome`)

The hero on `/welcome` cycles **vehicle segments**, not the racing models, so
it looks for these four folder ids:

```
hatchback/   sedan/   suv/   luxury/
```

Until a photo lands in one of these, that segment falls back to generated
geometry — a plain grey silhouette that reads as placeholder art, because
that is what it is. It is fine as an honest "no photo supplied" state and
poor as the hero image of a marketing page, so put a real photo here before
showing this to anyone.

One image per folder gives a still; two or more become a drag-scrubbable
360° turntable.
