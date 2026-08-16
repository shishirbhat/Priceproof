# samples/

Reference data captured from Bright Data Scraper Studio.

## collector_output.json

**Currently a placeholder — replace it before any code is written against it.**

This file should hold one real response from the collector, exactly as Bright Data
returned it. Everything downstream (database schema, normalization, the price
history tables) is written against the field names in this file, so it needs to be
genuine output rather than an approximation.

### Replacing it

Run the collector against the three demo products:

```
https://ecommerce-shop-brd.vercel.app/product/echo-portable-speaker
https://ecommerce-shop-brd.vercel.app/product/nimbus-cloud-storage
https://ecommerce-shop-brd.vercel.app/product/pulse-fitness-tracker
```

Then copy the returned JSON array over this file, either from the Studio output pane
or from the `scraper_studio_results_<timestamp>.json` written by
[Bright Data's Python boilerplate](https://github.com/brightdata/bright-data-scraper-studio-python-project).

### The field that matters most

Check that the **struck-through / list / MRP price** made it into the output as its
own field, separate from the current selling price. Price-history features depend on
having both. If the collector only captured one price, the collector's schema needs
fixing before anything else proceeds.

### Do not put credentials here

The API token and collector ID belong in `.env`, which is gitignored. This directory
is for scraped output shapes only.
