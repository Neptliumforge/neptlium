# Contributing

Start with `README.md`, root `AGENTS.md`, and `docs/README.md`. Read the nearest nested `AGENTS.md` before changing an application.

Use a focused branch and one coherent change. Preserve financial, provider, database, authentication, and design authorities. Do not create a second package, design system, provider abstraction, or document authority to avoid understanding the existing one.

Before opening a pull request, run the applicable repository commands from `docs/engineering/DEVELOPMENT.md`. Report checks as PASS, FAIL, BLOCKED, or NOT RUN; do not infer success from source inspection.

Normal development changes should reach `main` through a pull request. Do not force-push shared branches, rewrite applied migrations, commit secrets, or mix unrelated cleanup into a feature or fix.
