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

| Setting | What it does | Default |
| --- | --- | --- |
| Pause on hover | While your mouse is over chat, new messages wait instead of pushing what you're reading out of view. A bar shows how many are waiting; click it to let them through. | Off |
| Pause while holding a key | Hold Ctrl, Alt or Shift to pause chat from anywhere on the page. | Ctrl |
| Maximum held messages | If too many pile up while paused, they're let through anyway so chat doesn't fall too far behind. | 500 |
| Do not clear chat | When a moderator clears chat, you keep seeing it. | On |

### Deleted messages

| Setting | What it does | Default |
| --- | --- | --- |
| Show deleted messages | Messages removed by moderators stay visible instead of disappearing. | On |
| Style | Faded, crossed out, both, or blurred until you hover over them. | Faded and crossed out |

### Appearance

| Setting | What it does | Default |
| --- | --- | --- |
| Timestamps | A small grey time before every message, using the time it was actually sent. | On |
| 24-hour time | Shows times as 14:05 instead of 2:05 PM. | On |
| Show seconds | Adds seconds to timestamps. | Off |
| Settings button | Shows the gear icon in the top bar. It hides in theatre mode; Alt+Shift+K always works. | On |

### Interface

| Setting | What it does | Default |
| --- | --- | --- |
| Hide reward chest | Hides the animated "Claim Your Reward" button in the top bar. | On |
| Hide "Get KICKs" button | Hides it from the top bar. | On |
| Hide channel points | Hides them from below the chat box. | On |
| Hide Kicks gift shop button | Hides it from below the chat box. | On |
| Hide "Chat" button over the player | Hides the button Kick shows when chat is collapsed. Turn this off again to reopen chat. | On |
| Start in theatre mode | Every channel you open switches to theatre mode. | On |
| Start with chat closed | Every channel you open starts with chat collapsed. | Off |

### Filtering

| Setting | What it does | Default |
| --- | --- | --- |
| Hide subscription notices | Hides sub and resub messages. | On |
| Hide gifted subscription notices | Hides gift sub messages. | On |
| Hide Kicks gifts | Hides Kicks gift messages. | On |
| Hidden users | Never see messages from the people you list, such as bots. | Empty |
| Hidden message patterns | Hides messages matching your own patterns, for example commands starting with `!`. | Empty |
| Hidden chat line patterns | Hides any chat line whose visible text matches a pattern, for notices that aren't regular messages. | Empty |

Filters also apply to the chat history that loads when you open a channel.

### Advanced

For when Kick changes its site and something needs adjusting without waiting for an update.

| Setting | What it does |
| --- | --- |
| Chat container selector | Where TidyChat looks for the chat. |
| Hidden chat line selectors | Hides chat lines that contain a matching element. |
| Hidden page elements | Hides anything else on the page, such as the top gifters bar. |
| Extra socket events to drop | Blocks extra live chat event types by name. |
| Extra message types to drop | Blocks extra chat message types. |
| Theatre button pattern | How TidyChat finds Kick's theatre button. |
| Close chat button pattern | How TidyChat finds Kick's close-chat button. |
| Log socket events to the console | Shows the name of each kind of live chat event once, so you can find what to block. |

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
