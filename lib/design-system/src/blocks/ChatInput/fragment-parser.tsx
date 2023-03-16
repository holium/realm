import { isValidPatp } from 'urbit-ob';
import { FragmentPlainType, FragmentType } from '../Bubble/Bubble.types';

const parserRules = {
  bold: {
    token: '**',
    tokenLength: 2,
    recurse: true,
  },
  italics: {
    token: /(?<!\*)\*(?!\*)/,
    tokenLength: 1,
    recurse: true,
  },
  strike: {
    token: '~~',
    tokenLength: 2,
    recurse: true,
  },

  code: {
    token: '```',
    tokenLength: 3,
    recurse: false,
    priority: 0,
  },
  blockquote: {
    token: '> ',
    tokenLength: 2,
    ender: '\n',
    enderLength: 1,
    recurse: false,
    priority: 1,
  },
  'inline-code': {
    token: '`',
    tokenLength: 1,
    recurse: false,
    priority: 2,
  },
  ship: {
    regex: /~([a-z\-])+/i,
    filter: isValidPatp,
    recurse: false,
    priority: 2.5,
  },
  image: {
    regex:
      /(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#&//=]*)?\.(jpg|jpeg|png|gif|svg|webp|bmp|tif|tiff)(\?[-a-zA-Z0-9()@:%_\+.~#&//=]*)?/i,
    recurse: false,
    priority: 3,
  },
  link: {
    //regex: /\[[^\]]+\]\(([^)]+)\)/,
    regex:
      /(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/i,
    recurse: false,
    priority: 3.5,
  },
  'bold-italics-strike': {
    token: '***~~',
    ender: '~~***',
    tokenLength: 5,
    recurse: false,
    priority: 4,
  },
  break: {
    token: '\n',
    tokenLength: 1,
    recurse: false,
    priority: 5,
  },
};

const boldToken = '**';
const italicsToken = '*';
const strikeToken = '~~';
const boldItalicsToken = '***';
const boldStrikeToken = '**~~';
const boldItalicsStrikeToken = '***~~';
const blockquoteToken = '>';
const inlineCodeToken = '`';
const codeBlockToken = '```';
const lineBreakToken = '\n';

export const convertFragmentsToText = (fragments: FragmentType[]): string => {
  return fragments.map((fragment) => fragmentToText(fragment)).join('');
};

export const fragmentToText = (fragment: FragmentType): string => {
  const [type, text] = Object.entries(fragment)[0];
  if (type === 'plain') return text;
  if (type === 'bold') return `${boldToken}${text}${boldToken}`;
  if (type === 'italics') return `${italicsToken}${text}${italicsToken}`;
  if (type === 'strike') return `${strikeToken}${text}${strikeToken}`;
  if (type === 'boldItalics')
    return `${boldItalicsToken}${text}${boldItalicsToken}`;
  if (type === 'boldStrike')
    return `${boldStrikeToken}${text}${boldStrikeToken}`;
  if (type === 'boldItalicsStrike')
    return `${boldItalicsStrikeToken}${text}${boldItalicsStrikeToken}`;
  if (type === 'blockquote') return `${blockquoteToken}${text}`;
  if (type === 'inlineCode')
    return `${inlineCodeToken}${text}${inlineCodeToken}`;
  if (type === 'codeBlock') return `${codeBlockToken}${text}${codeBlockToken}`;
  if (type === 'lineBreak') return lineBreakToken;
  return text;
};

/* TEST STRING
plain***~~BIS~~***`***~~fake-BIS~~***`plain```codblock `fakeinline` ```plain```codebloc
b2.5 ***~~fakeBIS~~***
```plain ***~~BIS~~***
plain
> blockquote
> blockquote`fakecode`*fakeitalics* blockquote
~~s~~
~~s1 **b1** ~~
~~s1 *i1* s1.a~~
** bold ~~in-strike~~ **
** bold ~~in-strike *italics* b-s~~ bold **
* ital ~~i-s **BIS** i-s~~ ital **b-i** * **b**
 **bold** plain www.example.com plain ~tolwer-mogmer ~not-valid stuff
plain ~zod ~fed ~hostyv https://i.stack.imgur.com/58jhk.jpg?s=128&g=1&g&s=32 plain 
 */

// takes a string and a specialType key (like 'blockquote' or 'italics-strike') and
// parses it into an object of the fragment (if found) and the pre- and post- text surrounding that fragment from the initial string
const eatSpecialType = (
  raw: string,
  type: string
): { frag: FragmentType | null; pre: string; post: string } => {
  // default result when no enter and exit match is found in the string, is {frag:null, pre: raw, post: ''};
  let frag = null;
  let pre = raw;
  let post = '';

  if (parserRules[type].regex) {
    const match = raw.match(parserRules[type].regex);
    if (match) {
      const startIndex = match.index;
      const matchingText = match[0];
      const endIndex = startIndex + matchingText.length;
      if (!parserRules[type].filter || parserRules[type].filter(matchingText)) {
        pre = raw.substr(0, startIndex);
        post = raw.substr(endIndex);
        frag = { [type]: matchingText } as FragmentType;
      }
    }
  } else {
    let startIndex = raw.indexOf(parserRules[type].token);
    if (typeof parserRules[type].token !== 'string') {
      // handle regex (for italics since * is a subset of bold's **)
      startIndex = raw.match(parserRules[type].token);
      startIndex = startIndex ? startIndex.index : -1;
    }
    if (startIndex >= 0) {
      // we matched
      if (type === 'break') {
        pre = raw.substr(0, startIndex);
        post = raw.substr(startIndex + 1);
        frag = { break: null } as FragmentBreakType;
      } else {
        // see if we find an exit match
        const offset = startIndex + parserRules[type].tokenLength;
        const endToken = parserRules[type].ender || parserRules[type].token;
        let endTokenLength =
          parserRules[type].enderLength || parserRules[type].tokenLength;
        let stopIndex = raw.substr(offset).indexOf(endToken);
        if (typeof endToken !== 'string') {
          // handle regex (for italics since * is a subset of bold's **)
          stopIndex = raw.substr(offset).match(endToken);
          stopIndex = stopIndex ? stopIndex.index : -1;
        }
        if (stopIndex >= 0) {
          // there is an exit match
          let parsedIndex = offset + stopIndex + endTokenLength;
          pre = raw.substr(0, startIndex);
          post = raw.substr(parsedIndex);
          frag = { [type]: raw.substr(offset, stopIndex) } as FragmentType;
        }
      }
    }
  }

  return { frag, pre, post };
};

// just a little helper to deal with interpolating the eaten fragment into the results array-of-strings-and-fragments
const updateResults = (
  results: any[],
  snippetIndex,
  eaten: { frag: FragmentType | null; pre: string; post: string }
): any[] => {
  let arrPre = results.slice(0, snippetIndex);
  let arrPost = results.slice(snippetIndex + 1);
  results = arrPre;
  results.push(eaten.pre);
  results.push(eaten.frag);
  results.push(eaten.post);
  arrPost.forEach((i) => results.push(i));
  return results;
};

// master function to parse a string into rich-text fragments
// basic strategy is to iteratively pull out things we know are good from the original string, whittling down strings into typed fragments
export const parseChatInput = (input: string): FragmentType[] => {
  let results = [input];

  const recursiveKeys = Object.keys(parserRules).filter(
    (k) => parserRules[k].recurse
  );
  const nonRecursiveKeys = Object.keys(parserRules)
    .filter((k) => !parserRules[k].recurse)
    .sort((a, b) => parserRules[a].priority - parserRules[b].priority);

  let snippet = input;
  let snippetIndex = 0;
  while (results.find((e) => typeof e === 'string')) {
    snippetIndex = results.findIndex((e) => typeof e === 'string');
    snippet = results[snippetIndex];
    let matched = false;
    // handle the non-recursive types
    nonRecursiveKeys.forEach((key) => {
      if (!matched) {
        let eaten = eatSpecialType(snippet, key);
        if (eaten.frag) {
          results = updateResults(results, snippetIndex, eaten);
          matched = true;
        }
      }
    });
    // handle the recursive types
    // important that this happens AFTER the non-recursive types
    if (!matched) {
      let eats = {};
      recursiveKeys.forEach((key) => {
        eats[key] = eatSpecialType(snippet, key);
      });
      // find the one that starts earliest in the snippet
      let smallest = 10000000;
      let smallestKey = null;
      recursiveKeys.forEach((key) => {
        if (eats[key].frag && eats[key].pre.length < smallest) {
          smallest = eats[key].pre.length;
          smallestKey = key;
        }
      });
      if (smallestKey) {
        matched = true;
        // RECURSION HAPPENS HERE
        let innerFrags = parseChatInput(eats[smallestKey].frag[smallestKey]);
        for (let i = 0; i < innerFrags.length; i++) {
          if (innerFrags[i].plain) {
            innerFrags[i] = { [smallestKey]: innerFrags[i].plain };
          } else if (innerFrags[i].italics && smallestKey === 'bold') {
            innerFrags[i] = { 'bold-italics': innerFrags[i].italics };
          } else if (innerFrags[i].bold && smallestKey === 'italics') {
            innerFrags[i] = { 'bold-italics': innerFrags[i].bold };
          } else if (innerFrags[i].strike && smallestKey === 'bold') {
            innerFrags[i] = { 'bold-strike': innerFrags[i].strike };
          } else if (innerFrags[i].bold && smallestKey === 'strike') {
            innerFrags[i] = { 'bold-strike': innerFrags[i].bold };
          } else if (innerFrags[i].italics && smallestKey === 'strike') {
            innerFrags[i] = { 'italics-strike': innerFrags[i].italics };
          } else if (innerFrags[i].strike && smallestKey === 'italics') {
            innerFrags[i] = { 'italics-strike': innerFrags[i].strike };
          } else if (
            innerFrags[i]['bold-italics'] &&
            smallestKey === 'strike'
          ) {
            innerFrags[i] = {
              'bold-italics-strike': innerFrags[i]['bold-italics'],
            };
          } else if (
            innerFrags[i]['italics-strike'] &&
            smallestKey === 'bold'
          ) {
            innerFrags[i] = {
              'bold-italics-strike': innerFrags[i]['italics-strike'],
            };
          } else if (
            innerFrags[i]['bold-strike'] &&
            smallestKey === 'italics'
          ) {
            innerFrags[i] = {
              'bold-italics-strike': innerFrags[i]['bold-strike'],
            };
          }
        }
        let arrPre = results.slice(0, snippetIndex);
        let arrPost = results.slice(snippetIndex + 1);
        results = arrPre;
        results.push(eats[smallestKey].pre);
        innerFrags.forEach((inner) => results.push(inner));
        results.push(eats[smallestKey].post);
        arrPost.forEach((i) => results.push(i));
      }
    }
    // fall-back to plain if nothing else matched
    if (!matched) {
      results[snippetIndex] = { plain: snippet } as FragmentPlainType;
    }
    results = results.filter((i) => i !== '');
  }
  return results;
};
