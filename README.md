# Sway Clipper

Forked from "Obsidian Clipper": https://github.com/jplattel/obsidian-clipper

## Installation in Chrome

- Go to chrome://extensions and enable developer mode (top right)
- Select the `src` folder, to load unpacked extension.

## Troubleshooting

- A tab opens and closes shortly therafter and Obsidian doens't open
    - Double check your configuration options, and test it with the button at the bottom of the page.
    - Try opening: `https://jplattel.github.io/obsidian-clipper/clip.html`
    - Try specifying the vault name: `https://jplattel.github.io/obsidian-clipper/clip.html?vault=<vaultname>`


## Technical explanation

This clipper is made possible with a work-around, since Chrome Extensions are forbidden to open custom url-schemes directly. The way around this issue is a custom html page that is hosted on Github-pages and also included in the repository: `docs/clip.html`. This little file contains javascript that pulls the data like vault & note out of the url params. With this data, it reconstructs the obsidian url and opens the right note!
