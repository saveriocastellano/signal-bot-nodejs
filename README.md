# signal-bot-nodejs
Simple experimental NodeJS Signal bot based on signal-cli

This is NOT a complete bot, it's basically only a proof-of-concept that shows how to create a simple NodeJS bot for Signal.

The bot requires you to run `signal-cli` in HTTP daemon mode (signal-cli daemon --http). It uses signal-cli RPC endpoint
for Signal API calls (e.g. send messages) and signal-cli SSE (Server-Sent-Event) to receive the stream of events from Signal.
