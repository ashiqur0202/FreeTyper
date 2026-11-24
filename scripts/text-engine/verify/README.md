# Verifying quotes and facts

Nothing in the quotes or facts library may come from memory alone.

**Quotes** (public domain): get the book with `gutenberg.js`, then `verify-quotes.js` checks that the quote is an exact,
contiguous piece of the book text (after plain-ASCII changes to curly quotes and long dashes). A quote that is not found is
not added.

**Facts**: write the fact in our own words and list one or more phrases from the Wikipedia article that say the same thing.
`verify-facts.js` fetches the article and checks every phrase. Read the sentence around each phrase before you trust it:
a matching word is not a matching meaning.

Then add the item to `src/components/skills/typing/engine/library/quotes.ts` or `facts.ts` with today's date as `checked`.
