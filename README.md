# ez-money-tracker

> *"What is money but congealed human life, frozen time traded for bread, dreams, and temporary sanctuaries against the void?"*

---

## I. The Ontology of the Ledger

In the ancient river valleys of Mesopotamia, before the written word was an instrument of poetry or prophecy, it was a ledger. Humanity did not learn to write to record hymns to the gods; we learned to write to remember who owed how many bushels of barley to whom.

At its core, **ez-money-tracker** does not merely track currency. It chronicles the flux of your finite hours upon this earth. Every entry in a ledger is an epitaph of expended vital force:
- An **Income** is the return on your invested mortality—hours of your life surrendered to the world in exchange for symbolic tokens of survival and potentiality.
- An **Expense** is the quiet sacrifice of those tokens back into the ether, traded for shelter, sustenance, temporary pleasure, or fleeting artifacts of belonging.

To track money is not an exercise in cold materialism; it is an act of existential wakefulness. It is to look directly into the stream of causality and ask: *Where did my life go today?*

---

## II. The Trinity of Substance: Cash, Balance, Credit

Money is a shapeshifting phantom that tests the boundaries of faith:

```
        ┌──────────────────────────────────────────────┐
        │                 VALUE                        │
        │      (A collective hallucination of trust)   │
        └──────────────────────┬───────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
       [ Cash ]           [ Balance ]        [ Credit ]
      Tactile Dirt      Luminous Pixels    A Debt to Tomorrow
    (Memento Mori)      (The Cloud of Now) (The Shadow of Future)
```

1. **Cash (`cash`):** The visceral, decaying paper passed from palm to palm. It bears the soil and sweat of strangers. It exists in the tangible present.
2. **Balance (`balance`):** The ephemeral digits blinking in distant silicon memory banks. It represents potential energy—silent, invisible, waiting for collapse into kinetic reality.
3. **Credit (`credit`):** The borrowing of time from a tomorrow that is never guaranteed. Credit is an ontological promissory note written against your future heartbeat.

---

## III. Architectural Hermeneutics

In an unstable universe, software must be an anchor of deterministic certitude.

### 1. The Relational Cathedral: PostgreSQL
Why a relational database? Because reality is inherently relational. Every transaction is tethered to time (`date`), quantity (`amount`), intention (`category`), and nature (`type`). The schema enforces order upon entropy. It stands as an immutable covenant: what was recorded shall not spontaneously dissolve.

### 2. The Internal Bridge: Contemplative Isolation
The database container is secluded within an internal bridge network (`ez-money-network`), inaccessible to the chaotic clamor of the host machine's open ports. It resides in cloistered contemplation, communicating solely with the backend application. Like the unconscious mind, it cannot be prodded directly from the outside world; it speaks only through the structured intermediary of the API.

### 3. The Unchanging Contract: Single Source of Truth
There is but one `.env` at the root of existence. To scatter configuration across multiple files is to invite cognitive dissonance. One source, immutable, copied into the container runtime during genesis (`Dockerfile`), dictating the parameters of reality.

---

## IV. The Sacred Ritual: Quickstart

To awaken the tracking apparatus from dormancy:

### 1. Consecrate the Environment
Inspect the single source of truth:
```bash
cp .env.example .env
```
Meditate on the secret keys and ports that define your local reality.

### 2. Awaken the Relational Memory (Postgres)
```bash
cd postgres
docker compose up -d
```
The vault opens. Its internal bridge awaits communion.

### 3. Inscribe the Schema
```bash
cd ../backend
npx prisma db push
```
The archetypal table `transactions` crystallizes into the relational void.

### 4. Manifest the Application (Backend)
```bash
docker compose up -d --build
```
Or, for the artisan working directly with raw source:
```bash
npm install
npm run build
npm start
```
The gateway listens attentively on port `3000`.

---

## V. Invoking a Transaction

When an exchange occurs in the theatre of reality, report it to the ledger:

```bash
curl -X POST http://localhost:3000/record-transaction \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 4200,
    "type": "expense",
    "source": "balance",
    "category": "Books & Philosophy"
  }'
```

The system responds not merely with JSON, but with affirmation:
```json
{
  "id": "e4b2d5a1-7c9b-43f1-b84a-92a0e417df89",
  "amount": 4200,
  "type": "expense",
  "source": "balance",
  "category": "Books & Philosophy",
  "date": "2026-09-26T15:42:00.000Z",
  "is_deleted": false
}
```
*Another fraction of human agency is measured, categorized, and preserved against oblivion.*

---

## VI. Epilogue: The Soft Delete (`is_deleted`)

You will notice in the schema a quiet boolean: `is_deleted`.

In nature, nothing is ever truly destroyed; it merely changes form. So too in `ez-money-tracker`. We do not purge the past; we acknowledge that even our mistakes, misallocations, and abandoned paths remain woven into the fabric of who we were. To delete is simply to mark as forgotten, waiting in the silent shadows of the table.

---

*“Do not save what is left after spending, but spend what is left after saving your soul.”*
