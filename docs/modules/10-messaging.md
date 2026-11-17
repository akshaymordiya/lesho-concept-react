# Module 10 — Messaging

## Purpose

One conversation per lead between the consumer and the business. Replaces off-platform back-and-forth while keeping it tied to the reference.

## Rules

1. A thread is created with every lead. There are no free-standing chats.
2. A business can never start a thread. It can only reply on a lead the consumer created.
3. System messages record milestones (created, accepted, handed over, redeemed, expired) and cannot be edited.
4. Text only at launch, up to 1,000 characters. No links are made clickable unless they point to a Lesho page.
5. A consumer can close a thread; the business can then no longer send messages. Cancelling a lead also closes it after a final system message.
6. A business reply on a lead in `created` or `acknowledged` moves it to `contacted` (except rentals and claims, which follow their own paths).
7. Unread counts per side: messages after `lastReadSeq` that were not sent by that side and are not system messages.
8. Merchant staff see threads for their branches only. The consumer sees the business name, not the staff member.
9. Report and block: either side can report a thread; the consumer can block a business, which closes all its threads.

## Prototype screens

`Activity.jsx` → `Activity` (Messages tab with search and unread badges), `ConversationList`, `Chat` (header with QR or lead link, enquiry summary card, bubbles, system pills, typing indicator, quick replies, composer). `Merchant.jsx` → lead inbox Messages tab, "Message {name}" on lead detail.

## Entities

`threads`, `messages`, `thread_participants`.

## Endpoints

### GET /v1/me/threads        auth: consumer
### GET /v1/merchant/threads        staff+

`?q=&cursor=` → sorted by `lastMessageAt` desc.

```json
{ "data": [ { "id": "thr_…", "leadId": "led_…", "reference": "LSH-QUO-4T7M2", "typeLabel": "Quotation request",
  "counterpart": { "name": "Pixel Point Electronics", "verified": true },
  "lastMessage": { "seq": 4, "from": "business", "preview": "Your written quote is ready at the counter…", "at": "…" },
  "unread": 1, "closed": false } ] }
```

### GET /v1/threads/{id}/messages        auth: participant

`?beforeSeq=&limit=30` for history; `?afterSeq=&wait=25` for long polling (returns immediately when newer messages exist, otherwise holds up to 25 s and returns an empty list).

```json
{ "data": [ { "seq": 3, "from": "business", "body": "Hello Aarav…", "at": "…" }, { "seq": 4, "from": "system", "body": "Visit confirmed by the restaurant", "at": "…" } ],
  "thread": { "lastSeq": 4, "myLastReadSeq": 3, "otherLastReadSeq": 4, "closed": false } }
```

### POST /v1/threads/{id}/messages        auth: participant · idempotent

```json
{ "clientMessageId": "c_01J…", "body": "Can I come on Sunday instead?" }
```

`201` → the stored message with its `seq`. Errors: `409 thread_closed`, `422 body_too_long`, `429`.

### POST /v1/threads/{id}/read        auth: participant

`{ "seq": 7 }` → `204`. Monotonic: `lastReadSeq = max(current, seq)`.

### POST /v1/threads/{id}/typing        auth: participant

Fire-and-forget; fanned out over the socket only, never stored. Throttle to once every 3 s.

### POST /v1/me/threads/{id}/close        auth: consumer
### POST /v1/threads/{id}/report        auth: participant

### GET /v1/me/unread        auth: consumer
### GET /v1/merchant/unread        staff+

`{ "data": { "messages": 2, "leads": 1 } }` — used for badges; polled every 60 s as a safety net.

## Real-time

- Channel `thread:{id}`: `message.created`, `thread.read`, `typing`.
- Channel `user:{id}` and `business:{id}`: `thread.updated` (preview and unread) so inbox lists update without subscribing to every thread.
- Fallback when the socket is down: long polling on an open thread; 15 s short polling on the inbox list.
- Push notification for a new message when the recipient has no active socket on that thread.

## Atomic operations

```
send:
BEGIN
  SELECT thread FOR UPDATE; require not closed; require sender is a participant
  INSERT message (seq = thread.lastSeq + 1, unique (threadId, clientMessageId))
  UPDATE thread SET lastSeq = lastSeq + 1, lastMessageAt = now, lastMessagePreview = …
  if sender is business and lead in (created, acknowledged) and lead type not in (rental, claim): transition lead to contacted
  INSERT outbox
COMMIT
```

A retried send with the same `clientMessageId` returns the stored message.

## Edge cases

- Message sent while offline: the client queues it with its `clientMessageId` and sends on reconnect; the UI shows "Sending".
- Both sides typing at once: ordering is by `seq` assigned on the server.
- Lead expired or closed: thread becomes read-only with a banner.
- Very long threads: paginate history by `beforeSeq`.
- Abuse: keyword and rate-based flags go to the moderation queue; content is not scanned for anything else.
