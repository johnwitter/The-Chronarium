# Content guide: adding questions to History Arcade

This guide covers adding or editing questions **without touching the game code**.
All questions live in `questions/`. Leave `history-arcade.html` alone.

```
questions/
  world/unit1.js … unit9.js   AP World History: Modern
  euro/unit1.js  … unit9.js   AP European History
```

All 18 files already exist, and the game already loads all of them. A unit with no
topics shows as "Coming soon" in the unit picker. To add a unit, fill in its file.
Don't create, rename, or delete files.

## File layout

Each file calls `addUnit` exactly once:

```js
/* AP World History: Modern, Unit 5. Question format: see CONTENT_GUIDE.md. */
addUnit("world", 5, {
 title:"Revolutions, c. 1750–1900",
 topics:[
   {n:"5.1",t:"The Enlightenment",items:[
    ["mc", …],
    ["sort", …],
    ["seq", …]
   ]},
   {n:"5.2",t:"Nationalism and Revolutions in the Period from 1750 to 1900",items:[
    …
   ]}
 ]
});
```

- The first argument is `"world"` or `"euro"`. It must match the folder.
- The second argument is the unit number, 1–9. It must match the file name.
- `title` appears after "Unit N: " in the game. The stub files already contain
  the CED unit titles. Check them against the current Course and Exam Description.
- `topics` is the list of topics, in CED order.

## Topics

```js
{n:"5.1", t:"The Enlightenment", items:[ …questions… ]}
```

| Field | Meaning |
|---|---|
| `n` | CED topic number as a string, `"<unit>.<topic>"`, e.g. `"5.1"`. Must start with this file's unit number and be unique in the file. |
| `t` | CED topic title. |
| `items` | **3 to 26** questions. The existing units use 5 per topic. The exit ticket for a topic shows every item. |

## Question types

Each question is an array. The first element says which type it is.
Every type ends with an explanation ("why"), which students see after they answer.

### `mc`: multiple choice

```js
["mc", question, [option, option, …], correctIndex, why]
```

```js
["mc","What did the Treaty of Tordesillas (1494) do?",["Divided newly claimed lands outside Europe between Spain and Portugal","Ended the Reconquista","Gave the Dutch trading rights in Asia","Created the first joint-stock company"],0,"With papal backing, Spain and Portugal drew a dividing line, which is why Brazil became Portuguese."]
```

- `correctIndex` counts from 0. The game shuffles options on screen, so it's
  fine (and conventional here) to put the correct option first and use `0`.
- At least 2 options. Use 4 to match the AP exam. No two options may be identical.

### `sort`: sort items into categories

```js
["sort", question, [categoryA, categoryB, …], [[item, categoryIndex], …], why]
```

```js
["sort","Sort each motive for exploration.",["Economic","Religious"],[["Access to Asian spices",0],["West African gold",0],["Spreading Christianity",1],["Finding Christian allies against Muslim states",1]],"“Gold, God, and glory.” Pairing an economic and a religious motive shows complexity on an LEQ."]
```

- `categoryIndex` counts from 0 into the category list.
- At least 2 categories and 2 items. The game shuffles the item order.
- Two categories fit best on a phone. Three work, but keep the labels short.

### `seq`: put in order

```js
["seq", question, [first, second, …, last], why]
```

```js
["seq","Put these in chronological order, earliest first.",["Dias rounds the Cape of Good Hope (1488)","Columbus reaches the Caribbean (1492)","Treaty of Tordesillas (1494)","Vasco da Gama reaches Calicut (1498)","Magellan’s expedition circles the globe (1519–1522)"],"Within ten years, Iberian sailors opened both the Atlantic route to the Americas and the sea route to India."]
```

- List the items **in the correct order**. The game shuffles them.
- Note that `seq` has 4 parts, with no answer index.
- 4 or 5 items is the sweet spot. No two items may be identical.

## Writing rules

- **Plain text only.** HTML tags show up literally on screen.
- **Quotes:** strings use straight double quotes `"…"`, so use curly quotes and
  apostrophes inside the text (`“ ” ’`), as the existing questions do. A
  straight `"` inside a string breaks the file unless you write it as `\"`.
- Put a comma between items and between topics.
- Dates in parentheses, e.g. `(1494)`, help on `seq` questions.
- Keep the explanation to one or two sentences. Say why the answer is right, and
  where useful, why a tempting wrong answer is wrong.

## Question IDs: don't reorder published questions

The game builds an ID from each question's position: course letter + topic number
+ letter, e.g. `W4.2-b` is the second item in World topic 4.2. These IDs go to the
Google Form in the "missed" field. Ticket names work the same way, e.g. `W4.2-EXIT`.

So, once students have used a topic:

- Add new questions **at the end** of the topic's `items`.
- Don't reorder, insert into the middle of, or delete from the list. Doing so
  shifts every later ID, and older form responses will point at the wrong
  questions. To retire a question, rewrite it in place.
- Don't change a topic's `n`.

## How entry tickets use your questions

- **Exit ticket** for a topic: every item in that topic.
- **Entry ticket** for topic 2 onward: 4 random items from the earlier topics in
  the same unit.
- **Entry ticket** for a unit's **first topic**: 4 random items from the
  **previous unit** (all its topics). If the previous unit has no questions yet,
  or this is Unit 1, it uses 3 random items from the topic itself.

So filling in units in order (3 before 4, and so on) gives the best entry tickets.

## Checking your work

1. Run the checker from the repository root (needs Node.js):

   ```
   node tools/check-questions.js
   ```

   It reports file errors, wrong types, bad answer indexes, wrong topic numbers,
   duplicate options, and topics with too few items. The "Check questions" GitHub
   Action runs it on every pull request and every push to `main`.
2. Open `history-arcade.html` in a browser (double-clicking it works) and play
   the new tickets. If a unit you filled in still says "Coming soon", its file
   has an error. The checker or the browser console (F12) will say where.

## Publishing

The site is served by GitHub Pages from the `main` branch:
<https://johnwitter.github.io/The-Chronarium/>. Changes go live a minute or two
after they reach `main`. Students' browsers may keep the old version for up to
about 10 minutes. A reload after that picks up the new questions.

## Checklist for adding a unit

1. Open `questions/<course>/unitN.js`. Leave the `addUnit("<course>", N, {` line
   and the `title` as they are, unless the title is wrong.
2. Replace the "No topics yet" comment with topic objects, one per CED topic.
3. Give each topic 3 or more items (5 is standard), mixing `mc`, `sort`, and `seq`.
4. Run `node tools/check-questions.js` until it says OK.
5. Play at least one entry and one exit ticket in a browser.
