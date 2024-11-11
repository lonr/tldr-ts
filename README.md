# tldr-ts

> A tldr client with turbo speed.
> Display simple help pages for command-line tools from the tldr-pages project.

- Print the tldr page for a specific command:

`tldr {{command}}`

- Print the tldr page for a specific subcommand:

`tldr {{command}} {{subcommand}}`

- Print the tldr page for a command in the given [L]anguage (if available, otherwise fall back to English):

`tldr --language {{language_code}} {{command}}`

- Print the tldr page for a command from a specific [p]latform:

`tldr --platform {{android|common|freebsd|linux|osx|netbsd|openbsd|sunos|windows}} {{command}}`

- [u]pdate the local cache of tldr pages:

`tldr --update`
