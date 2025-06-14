![Showcase Card](/public/static/twitter-card.webp)

<div align="center">

# The Lt. Vault
A project to archive past VODs from Twitch.

</div>

This is a work-in-progress project that uses a combination of Airtable and other automations to maintain a fully functional VOD archive for Twitch streams, or even other platforms. Complete with:

* Chat Replay
* Game Category Sorting
* Date Sorting
* Keyword Searching (hopefully, soon)

And of course, this project is open source and fully available under the [MIT License](LICENSE) - modify to your hearts content.

## How does it work?
Originally derived from my own [website](https://github.com/theltwilson/website), which was in itself derived from the [astro-erudite](https://github.com/jktrn/astro-erudite) template, this project removed a lot of the unnecessary junk that was scattered around the website and made VOD archival it's own separate thing.

By using the [Airtable loader](https://github.com/ascorbic/astro-loaders) for Astro, and some automation through a self-hosted [n8n](https://n8n.io) instance, we can run a fully functional VOD archive, where new VODs that enter the "published view" will trigger [Vercel](https://vercel.com) to rebuild the website. You can see how this flow works here:

![A flow chart that shows how the automation works.](https://cdn.ltwilson.tv/u/ZZfMze.png)

A full guide will (probably) be available at some point.