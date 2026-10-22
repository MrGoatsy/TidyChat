# TidyChat

Calmer, easier to read Kick chat: pause it, keep deleted messages, hide gift and sub spam.

<p align="center">
  <img width="500" height="381" alt="image" src="https://github.com/user-attachments/assets/4b19b2cd-a6db-435d-bfff-9304b7b6b78a" />
</p>


## Install

1. Install [Violentmonkey](https://violentmonkey.github.io/).
2. [Install TidyChat](https://raw.githubusercontent.com/MrGoatsy/TidyChat/main/tidychat.user.js).
3. Reload kick.com.

## Settings

Click the gear icon in the top bar or press **Shift+O**. The shortcut can be changed under Appearance. Changes save automatically. **Reset to defaults** restores everything.

## Features

### Chat behavior

| Setting | What it does | Default |
| --- | --- | --- |
| Pause on hover | Holds new messages while your mouse is over chat. Click the bar to release them. | Off |
| Pause while holding a key | Holds new messages while Ctrl, Alt or Shift is held. | Ctrl |
| Maximum held messages | Releases held messages once this many are waiting. | 500 |
| Do not clear chat | Ignores moderator chat clears. | On |

### Deleted messages

| Setting | What it does | Default |
| --- | --- | --- |
| Show deleted messages | Keeps messages removed by moderators visible. | On |
| Style | Faded, crossed out, both, or blurred until hovered. | Faded and crossed out |

### Appearance

| Setting | What it does | Default |
| --- | --- | --- |
| Timestamps | Shows the send time before each message. | On |
| 24-hour time | 14:05 instead of 2:05 PM. | On |
| Show seconds | Adds seconds to timestamps. | Off |
| Settings button | Shows the gear icon in the top bar. Hidden in theatre mode. | On |
| Settings shortcut | Key combination that opens settings. Ignored while typing in chat. | Shift+O |

### Interface

| Setting | What it does | Default |
| --- | --- | --- |
| Hide reward chest | Hides the "Claim Your Reward" button. | On |
| Hide "Get KICKs" button | Hides the "Get KICKs" button. | On |
| Hide channel points | Hides channel points below the chat box. | On |
| Hide Kicks gift shop button | Hides the gift shop button below the chat box. | On |
| Hide "Chat" button over the player | Hides the button that reopens collapsed chat. | On |
| Only hide "Chat" button in theatre mode | Keeps the button outside theatre mode. | On |
| Start in theatre mode | Opens every channel in theatre mode. | On |
| Start with chat closed | Opens every channel with chat collapsed. | Off |

### Filtering

| Setting | What it does | Default |
| --- | --- | --- |
| Hide subscription notices | Hides subs and resubs. | On |
| Hide gifted subscription notices | Hides gift subs. | On |
| Hide Kicks gifts | Hides Kicks gifts. | On |
| Hidden users | Hides messages from listed users. | Empty |
| Hidden message patterns | Hides messages matching a regex, e.g. `^!` for commands. | Empty |
| Hidden chat line patterns | Hides chat lines whose visible text matches a regex. | Empty |

Filters also apply to chat history.

### Advanced

| Setting | What it does |
| --- | --- |
| Chat container selector | CSS selector for the chat. |
| Hidden chat line selectors | Hides chat lines containing a matching element. |
| Hidden page elements | Hides any element matching a CSS selector. |
| Extra socket events to drop | Blocks chat events by name. |
| Extra message types to drop | Blocks chat message types. |
| Theatre button pattern | Regex used to find the theatre button. |
| Close chat button pattern | Regex used to find the close chat button. |
| Log socket events to the console | Logs each new chat event type once. |

## Troubleshooting

Run `tidyDebug()` in the browser console on a channel page to see how many chat lines were found, matched, timestamped and hidden.

## Notes

- Only messages deleted while the page is open can be shown.
- If something breaks after a Kick update, open an issue with the outer HTML of the broken element.
- Not affiliated with Kick.

## Also by the author

[Poltergeist](https://poltergeist.cc/mod-controlled-overlay) gives your moderators live control of your stream overlay, with no shared passwords or remote access to your PC.

## License

MIT
