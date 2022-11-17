import { ReferenceContent, resourceFromPath } from '@urbit/api';
import urbitOb, { isValidPatp } from 'urbit-ob';
import _ from 'lodash';

/**
 * Took this from landscape because we are using their dm system for now.
 * https://github.com/urbit/urbit/blob/cdd2b7902677e7d66fdd5d24569f313a2b38fb05/pkg/interface/src/logic/lib/tokenizeMessage.js
 */
export function getPermalinkForGraph(group: string, graph: string, index = '') {
  const groupLink = getPermalinkForAssociatedGroup(group);
  const { ship, name } = resourceFromPath(graph);
  return `${groupLink}/graph/${ship}/${name}${index}`;
}

function getPermalinkForAssociatedGroup(group: string) {
  const { ship, name } = resourceFromPath(group);
  return `web+urbitgraph://group/${ship}/${name}`;
}

type Permalink = AppPermalink | GraphPermalink | GroupPermalink;

export interface AppPermalink {
  type: 'app';
  link: string;
  ship: string;
  desk: string;
  path: string;
}

export interface GroupPermalink {
  type: 'group';
  group: string;
  link: string;
}

export interface GraphPermalink {
  type: 'graph';
  link: string;
  graph: string;
  group: string;
  index: string;
}

function parseGraphPermalink(
  link: string,
  group: string,
  segments: string[]
): GraphPermalink | null {
  const [kind, ship, name, ...index] = segments;
  if (kind !== 'graph') {
    return null;
  }
  const graph = `/ship/${ship}/${name}`;
  return {
    type: 'graph',
    link: link.slice(16),
    graph,
    group,
    index: `/${index.join('/')}`,
  };
}

export function permalinkToReference(link: Permalink): ReferenceContent {
  switch (link.type) {
    case 'graph':
      return { reference: { graph: _.omit(link, ['type', 'link']) } };
    case 'group':
      return { reference: { group: link.group } };
    case 'app':
      return { reference: { app: _.omit(link, ['type', 'link']) } };
  }
}

export function referenceToPermalink({
  reference,
}: ReferenceContent): Permalink {
  if ('graph' in reference) {
    const { graph, group, index } = reference.graph;
    const link = `web+urbitgraph://group${group.slice(5)}/graph${graph.slice(
      5
    )}${index}`;
    return {
      type: 'graph',
      link,
      ...reference.graph,
    };
  } else if ('app' in reference) {
    const { ship, desk, path } = reference.app;
    return {
      type: 'app',
      link: `web+urbitgraph://${ship}/${desk}${path}`,
      ship,
      desk,
      path,
    };
  } else {
    const link = `web+urbitgraph://group${reference.group.slice(5)}`;
    return {
      type: 'group',
      link,
      ...reference,
    };
  }
}

export function parsePermalink(url: string): Permalink | null {
  const [kind, ...rest] = url.slice(17).split('/');

  if (kind === 'group') {
    const [ship, name, ...graph] = rest;
    const group = `/ship/${ship}/${name}`;
    if (graph.length > 0) {
      return parseGraphPermalink(url, group, graph);
    }
    return {
      type: 'group',
      group,
      link: url.slice(11),
    };
  }

  if (isValidPatp(kind)) {
    const [desk, ...parts] = rest;
    const path = '/' + parts.join('/');
    return {
      type: 'app',
      link: url,
      ship: kind,
      desk,
      path,
    };
  }

  return null;
}

const URL_REGEX = new RegExp(
  String(
    /^([\s\S]*?)(([\w\-\+]+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]`#|]+[-a-zA-Z0-9:@;?&=\/%\+\*!'\(\)\$_\{\}\^~\[\]`#|])([\s\S]*)/
      .source
  )
);

const PATP_REGEX = /^([\s\S]*?)(~[a-z_-]+)([\s\S]*)/;

const GROUP_REGEX = new RegExp(
  String(/^([\s\S ]*?)(~[-a-z_]+\/[-a-z0-9]+)([\s\S]*)/.source)
);

const convertToGroupRef = (group: string) => `web+urbitgraph://group/${group}`;

export const isUrl = (str: string) => {
  try {
    return URL_REGEX.test(str);
  } catch (e) {
    return false;
  }
};

const raceRegexes = (str: string) => {
  let link = str.match(URL_REGEX);
  while (link?.[1]?.endsWith('(') || link?.[1].endsWith('[')) {
    const resumePos = link[1].length + link[2].length;
    const resume = str.slice(resumePos);
    link = resume.match(URL_REGEX);
    if (link) {
      link[1] = str.slice(0, resumePos) + link[1];
    }
  }
  const groupRef = str.match(GROUP_REGEX);
  const mention = str.match(PATP_REGEX);
  let pfix = str;
  let content, sfix;
  if (link) {
    pfix = link[1];
    sfix = link[4];
    const perma = parsePermalink(link[2]);
    if (perma) {
      content = permalinkToReference(perma);
    } else {
      content = { url: link[2] };
    }
  }
  // @ts-expect-error
  const perma = parsePermalink(convertToGroupRef(groupRef?.[2]));
  // @ts-expect-error
  const [, , host] = perma?.group.split('/') ?? [];
  if (
    groupRef &&
    groupRef[1].length < pfix?.length &&
    Boolean(perma) &&
    urbitOb.isValidPatp(host)
  ) {
    pfix = groupRef[1];
    // @ts-expect-error
    content = permalinkToReference(perma);
    sfix = groupRef[3];
  }
  if (
    mention &&
    urbitOb.isValidPatp(mention[2]) &&
    mention[1].length < pfix?.length
  ) {
    pfix = mention[1];
    content = { mention: mention[2] };
    sfix = mention[3];
  }
  return [pfix, content, sfix];
};

const tokenizeMessage = (text: string) => {
  const messages = [];
  // by line
  let blocks: any[] = [];
  let currBlock: any[] = [];
  const foo = text.split('`');
  foo.forEach((str, index) => {
    const isCode = index % 2 === 1;
    if (isCode) {
      blocks.push(str);
      return;
    }
    if (str.length === 0) {
      blocks.push('');
      return;
    }
    while (str.length > 0) {
      const resetAndPush = (content: string) => {
        if (currBlock.length > 0) {
          blocks.push(currBlock.join(''));
        }
        if (blocks.length > 0) {
          //  ended on a `
          if (blocks.length % 2 === 0) {
            blocks.push('');
          }
          messages.push({ text: blocks.join('`') });
        }
        currBlock = [];
        blocks = [];
        messages.push(content);
      };
      const [pfix, content, sfix] = raceRegexes(str);
      if (content) {
        // @ts-expect-error
        pfix?.length > 0 && currBlock.push(pfix);
        // @ts-expect-error
        resetAndPush(content);
        // @ts-expect-error
        str = sfix;
      } else {
        currBlock.push(str);
        str = '';
      }
    }
    blocks.push(currBlock.join(''));
    currBlock = [];
  });
  // ended on a `
  if (blocks.length % 2 === 0) {
    blocks.push('');
  }
  messages.push({ text: blocks.join('`') });
  return messages;
};

export { tokenizeMessage, URL_REGEX };

// export const linkify = (text: string) => {
//   const urlRegex =
//     /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
//   return text.replace(urlRegex, (url: string) => {
//     return url;
//   });
// };
