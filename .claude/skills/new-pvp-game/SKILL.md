---
name: new-pvp-game
description: Build a player-versus-player mini-game (lobby, stake, readiness, blind simultaneous moves, crowd fallback, DM invites) using the decisions already settled for the rock-paper-scissors duel. Use when adding ANY new game where two players face each other, or when extending the duel itself. Carries the answers to questions that were argued through once — do not re-open them.
---

# new-pvp-game

Every PvP game in this project inherits the same skeleton: a lobby, a stake in tickets, a readiness handshake, blind simultaneous moves judged by the server, and a crowd bot when nobody live shows up. That skeleton was argued through in full for the rock-paper-scissors duel. **Reuse the answers below instead of asking again.**

Working prototypes, playable:

- duel with lobby, readiness, invites, crowd — https://claude.ai/code/artifact/b860604b-c40b-4594-8138-0d15c2af82dd
- vertical screen and thumb-reach rules — https://claude.ai/code/artifact/5c2aa674-2162-430f-be56-0aa385e7ca1b
- token art and visual language — https://claude.ai/code/artifact/a41f4c9c-197f-429e-b156-6ca3de60bc39

## Settled — do not re-ask

| Question                              | Answer                                                                                                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What is staked                        | **Tickets**, tier of the ticket picks the league. Not LC — LC is withdrawable, staking it makes the game gambling inside Telegram                                          |
| Who sets the stake                    | The **lobby creator**, 1–5 tickets. Cap is 5 because a bronze engine yields 12/day                                                                                         |
| When tickets leave the balance        | **At match start**, never at lobby creation. Cancelled waiting costs nothing                                                                                               |
| Platform commission                   | **None.** Winner takes both stakes whole. Duels are ticket-neutral; the sink stays tournament entry                                                                        |
| Readiness                             | Both press "Ready", **10 seconds**. Not a separate screen — it is a state of the arena, with the button where the tokens will appear                                       |
| Nobody confirmed                      | Tickets untouched. If the **creator** was silent, the lobby **closes** — "create a new one". If the guest was silent, the lobby survives and the creator keeps waiting     |
| After every match                     | Readiness is asked again. A rematch never auto-starts                                                                                                                      |
| Empty lobby                           | A **SeedPlayer** joins between **20 and 30 seconds** — a window, not a fixed second. Live players always take priority                                                     |
| Bot fairness                          | Move is **committed before the player's move** and drawn as an honest third. No patterns, no adjustment to what the player picked                                          |
| Bot payout                            | **Identical to a live match.** No reduced coefficient, no house edge                                                                                                       |
| Move secrecy                          | The server never reveals a move until **both** have arrived. The other side sees only a "moved" badge                                                                      |
| Timeout on a move                     | **Random figure**, never a loss. A stalled screen must not hand the round to the opponent                                                                                  |
| Round clock                           | Counted from **server time**, not from when the client rendered                                                                                                            |
| Opponent quits mid-match              | Their moves go random, the match finishes. Stakes are already spent — otherwise quitting becomes a way not to lose                                                         |
| Transport                             | **Short polling**, 600 ms in a match, 3 s in a lobby, one request returns the whole state, read from **Redis** not Postgres. WebSocket only when match volume justifies it |
| Spinners                              | Only for the **network hop** (200–300 ms). Waiting for the opponent is a game state, not a loader — a spinner there reads as a frozen app                                  |
| Invites                               | DM through the bot, only to players who enabled it. Unreachable players **cannot be selected at all**                                                                      |
| Invite link                           | Opens **straight into the arena** of that lobby. No list, no onboarding, no modal on the way                                                                               |
| Creator left before the guest arrived | "Opponent didn't wait" modal, tickets untouched, back to the lobby list                                                                                                    |

## Ask the user, per game

Only these. Everything else is answered above.

1. **What the round is** — the actual play (three tokens? a grid? a number?) and how a winner is decided.
2. **Match length** — first to 2, first to 3, or fixed rounds. Drives how long a session lasts.
3. **Seconds per move** — 5 s is the duel's number; a heavier game may need more.
4. **Whether skill exists** — against a fair bot there is none by construction. If the game should reward skill, it has to come from the live opponent or from the rules, not from bot patterns.

## Screen states

One screen, states swap in place. Never a wizard.

```
list → stake → waiting → ready → playing → result → (ready again)
                  ↑                  ↓
                  └── invite      modal (nobody confirmed / opponent left)
```

- `list` — open lobbies with name, stake, waiting time; "Create lobby" at the bottom
- `stake` — 1–5 chips, note that tickets leave only at start
- `waiting` — pulse, elapsed clock, "Invite players", "Cancel"
- `ready` — the arena already, both face-down tokens, badges, 10 s bar, one green button
- `playing` — opponent's hand at the top (not tappable), yours at the bottom in thumb reach
- `result` — outcome stays on screen, "Ready for rematch" and "Back to lobby"

## Server rules — the non-negotiable half

The client draws; the server decides. Concretely:

- The bot's move is written into the round **at creation**, not computed when the player's move arrives. Anyone who opens the network tab will check this first.
- A move is **one per round, idempotent**. A second tap changes nothing.
- Reveal timing is the server's; both clients receive the same event. Faster connection must not mean earlier knowledge.
- Ticket movement happens in the same transaction as the result, with a ledger row per side.
- Guard every debit with `updateMany where count gte` + `if count === 0 throw` — the pattern already used in wallet/lc/engines/market. Reading a balance before the transaction is a race, and this project has been bitten by it.

## Telegram reality

- **The bot cannot write first.** Measured on production: a broadcast to 283 recipients delivered **0**; reachability across the roster is **3–4 %**. Anything that depends on a DM must show who will actually receive it.
- Ask for permission with `WebApp.requestWriteAccess` on a **real tap** — from `useEffect` Telegram silently ignores it. Good moment: the first time a player creates a lobby.
- Trust `user.allows_write_to_pm` from signed initData, and store it as nullable (`true` / `false` / `null` for clients older than 6.9).
- `botWriteAllowed: { not: false }` **does not match NULL**. Write `OR: [{ ...: null }, { ...: true }]`.

## Economy accounting

- Live match = transfer. Tickets move between players, the total is unchanged.
- Match against the crowd = **mint or burn**. No commission means the expectation is around zero, but the variance is real.
- Keep a **separate ledger line for crowd matches** — in and out. Not to tune the odds, but to notice when reality drifts from the expectation, which would mean a bug rather than bad luck.

## Where the code goes

Backend (`../lucky-ticket-backend`):

- `src/games/<name>/` — service, controller, scheduler; state of a live round in Redis
- Prisma models for match/round/participant; ticket movement through the existing `TicketBalance` guard pattern
- Config knobs in `PlatformConfig` so the admin can retune without a deploy

Mini App:

- `src/api/<name>.api.ts` + tag in `src/constants/rtk-tags.ts` + mock spread into `src/mock/index.mock.ts` — all three, or it 404s at runtime
- Screens under `(out-tabs)/(tabs-extra)/games/<name>/`
- `en` + `ru` only while wording can still change, then `npm run i18n:draft`

Admin panel:

- Toggle, schedule, stake bounds, prize pool — the mode must be switchable without a deploy, like the roulette

## Checklist before calling it done

- [ ] Bot move committed before the player's, verified in the network tab
- [ ] Opponent's move invisible until both arrived
- [ ] Timeout gives a random figure, not a loss
- [ ] Stakes debited at start, refunded never, guarded against races
- [ ] Creator-silent closes the lobby, guest-silent does not
- [ ] Crowd joins in a 20–30 s window and always confirms
- [ ] Payout identical for bot and live matches
- [ ] Invite list marks unreachable players and blocks selecting them
- [ ] Deep link lands in the arena with nothing in between
- [ ] No spinner while waiting for the opponent
- [ ] Buttons at least 96 px tall, bottom inset ≥ 24 px, nothing tappable in the top 190 px
