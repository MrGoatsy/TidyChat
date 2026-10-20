# TidyChat

Makes Kick chat calmer and easier to read: pause it while you read, see deleted messages, and hide the gift and sub spam.

<p align="center">
  <img width="500" height="381" alt="image" src="https://github.com/user-attachments/assets/4b19b2cd-a6db-435d-bfff-9304b7b6b78a" />
</p>


## Install

1. Install a userscript manager: [Violentmonkey](https://violentmonkey.github.io/).
2. [Click here to install TidyChat](https://raw.githubusercontent.com/MrGoatsy/TidyChat/main/tidychat.user.js). Your userscript manager will open an install page.
3. Reload kick.com.

## Settings

Click the gear icon in the top bar, or press **Alt+Shift+K** anywhere on Kick. Use the search box to find any setting by name. Changes apply right away and are saved in your browser. **Reset to defaults** at the bottom of the panel puts everything back.

## Features

### Chat behavior
- **Pause on hover.** While your mouse is over chat, new messages wait instead of pushing what you're reading out of view. A bar shows how many are waiting; click it to let them through. *On by default.*
- **Pause while holding a key.** Hold Ctrl (or Alt or Shift) to pause chat from anywhere on the page. *Ctrl by default.*
- **Maximum held messages.** If too many pile up while paused, they're let through anyway so chat doesn't fall too far behind. *500 by default.*
- **Do not clear chat.** When a moderator clears chat, you keep seeing it. *On by default.*

### Deleted messages
- **Show deleted messages.** Messages removed by moderators stay visible instead of disappearing. *On by default.*
- **Style.** Choose how they look: faded, crossed out, both, or blurred until you hover over them. *Faded and crossed out by default.*

### Appearance
- **Timestamps.** A small grey time before every message, using the time the message was actually sent. *On by default.*
- **24-hour time.** *On by default.*
- **Show seconds.** *Off by default.*
- **Settings button.** Show or hide the gear icon. It sits in the top bar and hides in theatre mode. Alt+Shift+K always works. *On by default.*

### Interface
- **Hide reward chest.** The animated "Claim Your Reward" button in the top bar. *On by default.*
- **Hide "Get KICKs" button.** In the top bar. *On by default.*
- **Hide channel points.** Below the chat box. *On by default.*
- **Hide Kicks gift shop button.** Below the chat box. *On by default.*
- **Hide "Chat" button over the player.** The button Kick shows when chat is collapsed. With this on, turn it off again to reopen chat. *On by default.*
- **Start in theatre mode.** Every channel you open switches to theatre mode. *On by default.*
- **Start with chat closed.** Every channel you open starts with chat collapsed. *Off by default.*

### Filtering
- **Hide subscription notices**, including resub messages. *On by default.*
- **Hide gifted subscription notices.** *On by default.*
- **Hide Kicks gifts.** *On by default.*
- **Hidden users.** Never see messages from the people you list, such as bots.
- **Hidden message patterns.** Hide messages that match your own patterns, for example chat commands starting with `!`.
- **Hidden chat line patterns.** Hide any line in chat whose visible text matches a pattern, for notices that aren't regular messages.

Filters also apply to the chat history that loads when you open a channel.

### Advanced
For when Kick changes its site and something needs adjusting without waiting for an update.
- **Chat container selector.** Where TidyChat looks for the chat.
- **Hidden chat line selectors.** Hide chat lines that contain a matching element.
- **Hidden page elements.** Hide anything else on the page, such as the top gifters bar.
- **Extra socket events to drop.** Block extra live chat event types by name.
- **Extra message types to drop.** Block extra chat message types.
- **Theatre button pattern** and **Close chat button pattern.** How TidyChat finds Kick's theatre and close-chat buttons.
- **Log socket events to the console.** Shows the name of each kind of live chat event once, so you can find what to block.

## Troubleshooting

Run `tidyDebug()` in your browser console on a channel page. It shows whether the chat was found, how many messages were matched, timestamped and hidden, and prints the last chat line, which is useful in a bug report.

## Good to know

- Deleted messages can only be shown if they arrived while you had the page open.
- Kick changes its site often. If something stops working, open an issue and include the HTML of the element that broke (right-click it, Inspect, Copy outer HTML).
- Not affiliated with Kick.

## Credits

Settings icon from [Material Icons](https://github.com/google/material-design-icons) by Google, licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

## License

MIT
