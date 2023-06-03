// @ts-ignore
import { isValidPatp } from 'urbit-ob';

import {
  FragmentBreakType,
  FragmentKey,
  FragmentPlainType,
  FragmentType,
  TEXT_TYPES,
} from '../Bubble/Bubble.types';

type ParserKey =
  | 'bold'
  | 'italics'
  | 'strike'
  | 'code'
  | 'blockquote'
  | 'inline-code'
  | 'ship'
  | 'image'
  | 'link'
  | 'bold-italics-strike'
  | 'break';

type ParserRule = {
  recurse: boolean;
  token?: string | RegExp;
  tokenLength?: number;
  ender?: string | RegExp;
  enderLength?: number;
  priority?: number;
  regex?: RegExp;
  filter?: (s: string) => boolean;
  printToken?: string;
};
type ParserRules = {
  [K in ParserKey]: ParserRule;
};

const parserRules: ParserRules = {
  bold: {
    token: '**',
    tokenLength: 2,
    recurse: true,
  },
  italics: {
    printToken: '*',
    token: /(((?<!\*)\*(?!\*))|(^\*(?!\*)))/,
    tokenLength: 1,
    recurse: true,
  },
  strike: {
    token: '~~',
    tokenLength: 2,
    recurse: true,
  },

  code: {
    token: /```\n?/,
    tokenLength: 3,
    ender: '```',
    printToken: '```',
    enderLength: 3,
    recurse: false,
    priority: 0,
  },
  blockquote: {
    token: /(^|\n)> /,
    tokenLength: 2,
    ender: /\n|$/,
    enderLength: 1,
    printToken: '\n> ',
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
    regex: /~([a-z-])+/i,
    filter: isValidPatp,
    recurse: false,
    priority: 2.5,
  },
  image: {
    regex:
      // /(https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#&//=]*)?\.(jpg|jpeg|png|gif|svg|webp|bmp|tif|tiff)(\?[-a-zA-Z0-9()@:%_+.~#&//=]*)?/i,
      /(https?:\/\/)?(pbs.twimg.com\/media\/[-a-zA-Z0-9@:%._+~#=]{1,256}\?[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#&//=]*)?=(jpg|jpeg|png|gif|svg|webp|bmp|tif|tiff)(&[-a-zA-Z0-9()@:%_+.~#&//=]*)?)|(https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#&//=]*)?\.(jpg|jpeg|png|gif|svg|webp|bmp|tif|tiff)(\?[-a-zA-Z0-9()@:%_+.~#&//=]*)?/i,
    recurse: false,
    priority: 3,
  },
  link: {
    regex:
      /(?<=(^|\s|\n))((http|https|ftp):\/\/)?(www\.)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.(NORTHWESTERNMUTUAL|TRAVELERSINSURANCE|AMERICANEXPRESS|KERRYPROPERTIES|SANDVIKCOROMANT|AMERICANFAMILY|BANANAREPUBLIC|COOKINGCHANNEL|KERRYLOGISTICS|WEATHERCHANNEL|INTERNATIONAL|LIFEINSURANCE|TRAVELCHANNEL|WOLTERSKLUWER|CONSTRUCTION|LPLFINANCIAL|SCHOLARSHIPS|VERSICHERUNG|ACCOUNTANTS|BARCLAYCARD|BLACKFRIDAY|BLOCKBUSTER|BRIDGESTONE|CALVINKLEIN|CONTRACTORS|CREDITUNION|ENGINEERING|ENTERPRISES|FOODNETWORK|INVESTMENTS|KERRYHOTELS|LAMBORGHINI|MOTORCYCLES|OLAYANGROUP|PHOTOGRAPHY|PLAYSTATION|PRODUCTIONS|PROGRESSIVE|REDUMBRELLA|WILLIAMHILL|ACCOUNTANT|APARTMENTS|ASSOCIATES|BASKETBALL|BNPPARIBAS|BOEHRINGER|CAPITALONE|CONSULTING|CREDITCARD|CUISINELLA|EUROVISION|EXTRASPACE|FOUNDATION|HEALTHCARE|IMMOBILIEN|INDUSTRIES|MANAGEMENT|MITSUBISHI|NEXTDIRECT|PROPERTIES|PROTECTION|PRUDENTIAL|REALESTATE|REPUBLICAN|RESTAURANT|SCHAEFFLER|TATAMOTORS|TECHNOLOGY|UNIVERSITY|VLAANDEREN|VOLKSWAGEN|ACCENTURE|ALFAROMEO|ALLFINANZ|AMSTERDAM|ANALYTICS|AQUARELLE|BARCELONA|BLOOMBERG|CHRISTMAS|COMMUNITY|DIRECTORY|EDUCATION|EQUIPMENT|FAIRWINDS|FINANCIAL|FIRESTONE|FRESENIUS|FRONTDOOR|FURNITURE|GOLDPOINT|HISAMITSU|HOMEDEPOT|HOMEGOODS|HOMESENSE|INSTITUTE|INSURANCE|KUOKGROUP|LANCASTER|LANDROVER|LIFESTYLE|MARKETING|MARSHALLS|MELBOURNE|MICROSOFT|PANASONIC|PASSAGENS|PRAMERICA|RICHARDLI|SHANGRILA|SOLUTIONS|STATEBANK|STATEFARM|STOCKHOLM|TRAVELERS|VACATIONS|YODOBASHI|ABUDHABI|AIRFORCE|ALLSTATE|ATTORNEY|BARCLAYS|BAREFOOT|BARGAINS|BASEBALL|BOUTIQUE|BRADESCO|BROADWAY|BRUSSELS|BUILDERS|BUSINESS|CAPETOWN|CATERING|CATHOLIC|CIPRIANI|CITYEATS|CLEANING|CLINIQUE|CLOTHING|COMMBANK|COMPUTER|DELIVERY|DELOITTE|DEMOCRAT|DIAMONDS|DISCOUNT|DISCOVER|DOWNLOAD|ENGINEER|ERICSSON|ETISALAT|EXCHANGE|FEEDBACK|FIDELITY|FIRMDALE|FOOTBALL|FRONTIER|GOODYEAR|GRAINGER|GRAPHICS|GUARDIAN|HDFCBANK|HELSINKI|HOLDINGS|HOSPITAL|INFINITI|IPIRANGA|ISTANBUL|JPMORGAN|LIGHTING|LUNDBECK|MARRIOTT|MASERATI|MCKINSEY|MEMORIAL|MERCKMSD|MORTGAGE|OBSERVER|PARTNERS|PHARMACY|PICTURES|PLUMBING|PROPERTY|REDSTONE|RELIANCE|SAARLAND|SAMSCLUB|SECURITY|SERVICES|SHOPPING|SHOWTIME|SOFTBANK|SOFTWARE|STCGROUP|SUPPLIES|TRAINING|VANGUARD|VENTURES|VERISIGN|WOODSIDE|YOKOHAMA|ABOGADO|ACADEMY|AGAKHAN|ALIBABA|ANDROID|ATHLETA|AUCTION|AUDIBLE|AUSPOST|AVIANCA|BANAMEX|BAUHAUS|BENTLEY|BESTBUY|BOOKING|BROTHER|CAPITAL|CARAVAN|CAREERS|CHANNEL|CHARITY|CHINTAI|CITADEL|CLUBMED|COLLEGE|COLOGNE|COMCAST|COMPANY|COMPARE|CONTACT|COOKING|CORSICA|COUNTRY|COUPONS|COURSES|CRICKET|CRUISES|DENTIST|DIGITAL|DOMAINS|EXPOSED|EXPRESS|FARMERS|FASHION|FERRARI|FERRERO|FINANCE|FISHING|FITNESS|FLIGHTS|FLORIST|FLOWERS|FORSALE|FROGANS|FUJITSU|GALLERY|GENTING|GODADDY|GROCERY|GUITARS|HAMBURG|HANGOUT|HITACHI|HOLIDAY|HOSTING|HOTELES|HOTMAIL|HYUNDAI|ISMAILI|JEWELRY|JUNIPER|KITCHEN|KOMATSU|LACAIXA|LANXESS|LASALLE|LATROBE|LECLERC|LIMITED|LINCOLN|MARKETS|MONSTER|NETBANK|NETFLIX|NETWORK|NEUSTAR|OKINAWA|OLDNAVY|ORGANIC|ORIGINS|PHILIPS|PIONEER|POLITIE|REALTOR|RECIPES|RENTALS|REVIEWS|REXROTH|SAMSUNG|SANDVIK|SCHMIDT|SCHWARZ|SCIENCE|SHIKSHA|SINGLES|STAPLES|STORAGE|SUPPORT|SURGERY|SYSTEMS|TEMASEK|THEATER|THEATRE|TICKETS|TIFFANY|TOSHIBA|TRADING|WALMART|WANGGOU|WATCHES|WEATHER|WEBSITE|WEDDING|WHOSWHO|WINDOWS|WINNERS|XFINITY|YAMAXUN|YOUTUBE|ZUERICH|ABARTH|ABBOTT|ABBVIE|AFRICA|AGENCY|AIRBUS|AIRTEL|ALIPAY|ALSACE|ALSTOM|AMAZON|ANQUAN|ARAMCO|AUTHOR|BAYERN|BEAUTY|BERLIN|BHARTI|BOSTIK|BOSTON|BROKER|CAMERA|CAREER|CASINO|CENTER|CHANEL|CHROME|CHURCH|CIRCLE|CLAIMS|CLINIC|COFFEE|COMSEC|CONDOS|COUPON|CREDIT|CRUISE|DATING|DATSUN|DEALER|DEGREE|DENTAL|DESIGN|DIRECT|DOCTOR|DUNLOP|DUPONT|DURBAN|EMERCK|ENERGY|ESTATE|EVENTS|EXPERT|FAMILY|FLICKR|FUTBOL|GALLUP|GARDEN|GEORGE|GIVING|GLOBAL|GOOGLE|GRATIS|HEALTH|HERMES|HIPHOP|HOCKEY|HOTELS|HUGHES|IMAMAT|INSURE|INTUIT|JAGUAR|JOBURG|JUEGOS|KAUFEN|KINDER|KINDLE|KOSHER|LANCIA|LATINO|LAWYER|LEFRAK|LIVING|LOCKER|LONDON|LUXURY|MADRID|MAISON|MAKEUP|MARKET|MATTEL|MOBILE|MONASH|MORMON|MOSCOW|MUSEUM|MUTUAL|NAGOYA|NATURA|NISSAN|NISSAY|NORTON|NOWRUZ|OFFICE|OLAYAN|ONLINE|ORACLE|ORANGE|OTSUKA|PFIZER|PHOTOS|PHYSIO|PICTET|QUEBEC|RACING|REALTY|REISEN|REPAIR|REPORT|REVIEW|ROCHER|ROGERS|RYUKYU|SAFETY|SAKURA|SANOFI|SCHOOL|SCHULE|SEARCH|SECURE|SELECT|SHOUJI|SOCCER|SOCIAL|STREAM|STUDIO|SUPPLY|SUZUKI|SWATCH|SYDNEY|TAIPEI|TAOBAO|TARGET|TATTOO|TENNIS|TIENDA|TJMAXX|TKMAXX|TOYOTA|TRAVEL|UNICOM|VIAJES|VIKING|VILLAS|VIRGIN|VISION|VOTING|VOYAGE|VUELOS|WALTER|WEBCAM|XIHUAN|YACHTS|YANDEX|ZAPPOS|ACTOR|ADULT|AETNA|AMFAM|AMICA|APPLE|ARCHI|AUDIO|AUTOS|AZURE|BAIDU|BEATS|BIBLE|BINGO|BLACK|BOATS|BOSCH|BUILD|CANON|CARDS|CHASE|CHEAP|CISCO|CITIC|CLICK|CLOUD|COACH|CODES|CROWN|CYMRU|DABUR|DANCE|DEALS|DELTA|DRIVE|DUBAI|EARTH|EDEKA|EMAIL|EPSON|FAITH|FEDEX|FINAL|FOREX|FORUM|GALLO|GAMES|GIFTS|GIVES|GLASS|GLOBO|GMAIL|GREEN|GRIPE|GROUP|GUCCI|GUIDE|HOMES|HONDA|HORSE|HOUSE|HYATT|IKANO|IRISH|JETZT|KOELN|KYOTO|LAMER|LEASE|LEGAL|LEXUS|LILLY|LIPSY|LOANS|LOCUS|LOTTE|LOTTO|MANGO|MEDIA|MIAMI|MONEY|MOVIE|MUSIC|NEXUS|NIKON|NINJA|NOKIA|NOWTV|OMEGA|OSAKA|PARIS|PARTS|PARTY|PHONE|PHOTO|PIZZA|PLACE|POKER|PRAXI|PRESS|PRIME|PROMO|QUEST|RADIO|REHAB|REISE|RICOH|ROCKS|RODEO|RUGBY|SALON|SENER|SEVEN|SHARP|SHELL|SHOES|SKYPE|SLING|SMART|SMILE|SOLAR|SPACE|SPORT|STADA|STORE|STUDY|STYLE|SUCKS|SWISS|TATAR|TIRES|TIROL|TMALL|TODAY|TOKYO|TOOLS|TORAY|TOTAL|TOURS|TRADE|TRUST|TUNES|TUSHU|UBANK|VEGAS|VIDEO|VODKA|VOLVO|WALES|WATCH|WEBER|WEIBO|WORKS|WORLD|XEROX|YAHOO|AARP|ABLE|AERO|AKDN|ALLY|AMEX|ARAB|ARMY|ARPA|ARTE|ASDA|ASIA|AUDI|AUTO|BABY|BAND|BANK|BBVA|BEER|BEST|BIKE|BING|BLOG|BLUE|BOFA|BOND|BOOK|BUZZ|CAFE|CALL|CAMP|CARE|CARS|CASA|CASE|CASH|CBRE|CERN|CHAT|CITI|CITY|CLUB|COOL|COOP|CYOU|DATA|DATE|DCLK|DEAL|DELL|DESI|DIET|DISH|DOCS|DVAG|ERNI|FAGE|FAIL|FANS|FARM|FAST|FIAT|FIDO|FILM|FIRE|FISH|FLIR|FOOD|FORD|FREE|FUND|GAME|GBIZ|GENT|GGEE|GIFT|GMBH|GOLD|GOLF|GOOG|GUGE|GURU|HAIR|HAUS|HDFC|HELP|HERE|HGTV|HOST|HSBC|ICBC|IEEE|IMDB|IMMO|INFO|ITAU|JAVA|JEEP|JOBS|JPRS|KDDI|KIDS|KIWI|KPMG|KRED|LAND|LEGO|LGBT|LIDL|LIFE|LIKE|LIMO|LINK|LIVE|LOAN|LOVE|LTDA|LUXE|MAIF|MEET|MEME|MENU|MINI|MINT|MOBI|MODA|MOTO|NAME|NAVY|NEWS|NEXT|NICO|NIKE|OLLO|OPEN|PAGE|PARS|PCCW|PICS|PING|PINK|PLAY|PLUS|POHL|PORN|POST|PROD|PROF|QPON|READ|REIT|RENT|REST|RICH|ROOM|RSVP|RUHR|SAFE|SALE|SARL|SAVE|SAXO|SCOT|SEAT|SEEK|SEXY|SHAW|SHIA|SHOP|SHOW|SILK|SINA|SITE|SKIN|SNCF|SOHU|SONG|SONY|SPOT|STAR|SURF|TALK|TAXI|TEAM|TECH|TEVA|TIAA|TIPS|TOWN|TOYS|TUBE|VANA|VISA|VIVA|VIVO|VOTE|VOTO|WANG|WEIR|WIEN|WIKI|WINE|WORK|XBOX|YOGA|ZARA|ZERO|ZONE|AAA|ABB|ABC|ACO|ADS|AEG|AFL|AIG|ANZ|AOL|APP|ART|AWS|AXA|BAR|BBC|BBT|BCG|BCN|BET|BID|BIO|BIZ|BMS|BMW|BOM|BOO|BOT|BOX|BUY|BZH|CAB|CAL|CAM|CAR|CAT|CBA|CBN|CBS|CEO|CFA|CFD|COM|CPA|CRS|DAD|DAY|DDS|DEV|DHL|DIY|DNP|DOG|DOT|DTV|DVR|EAT|ECO|EDU|ESQ|EUS|FAN|FIT|FLY|FOO|FOX|FRL|FTR|FUN|FYI|GAL|GAP|GAY|GDN|GEA|GLE|GMO|GMX|GOO|GOP|GOT|GOV|HBO|HIV|HKT|HOT|HOW|IBM|ICE|ICU|IFM|INC|ING|INK|INT|IST|ITV|JCB|JIO|JLL|JMP|JNJ|JOT|JOY|KFH|KIA|KIM|KPN|KRD|LAT|LAW|LDS|LLC|LLP|LOL|LPL|LTD|MAN|MAP|MBA|MED|MEN|MIL|MIT|MLB|MLS|MMA|MOE|MOI|MOM|MOV|MSD|MTN|MTR|NAB|NBA|NEC|NET|NEW|NFL|NGO|NHK|NOW|NRA|NRW|NTT|NYC|OBI|ONE|ONG|ONL|OOO|ORG|OTT|OVH|PAY|PET|PHD|PID|PIN|PNC|PRO|PRU|PUB|PWC|RED|REN|RIL|RIO|RIP|RUN|RWE|SAP|SAS|SBI|SBS|SCA|SCB|SEW|SEX|SFR|SKI|SKY|SOY|SPA|SRL|STC|TAB|TAX|TCI|TDK|TEL|THD|TJX|TOP|TRV|TUI|TVS|UBS|UNO|UOL|UPS|VET|VIG|VIN|VIP|WED|WIN|WME|WOW|WTC|WTF|XIN|XXX|XYZ|YOU|YUN|ZIP|AC|AD|AE|AF|AG|AI|AL|AM|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|BB|BD|BE|BF|BG|BH|BI|BJ|BM|BN|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CC|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|CR|CU|CV|CW|CX|CY|CZ|DE|DJ|DK|DM|DO|DZ|EC|EE|EG|ER|ES|ET|EU|FI|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|SK|SL|SM|SN|SO|SR|SS|ST|SU|SV|SX|SY|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|TN|TO|TR|TT|TV|TW|TZ|UA|UG|UK|US|UY|UZ|VA|VC|VE|VG|VI|VN|VU|WF|WS|YE|YT|ZA|ZM|ZW)(:[0-9]{1,5})?(\/([-a-zA-Z0-9()@:%_+.~#?&//=]*)+)/i,
    // regex:
    //   /(https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}(\b|(\/([-a-zA-Z0-9()@:%_+.~#?&//=]*)+))/i,
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

/* TEST STRING
plain***~~BIS~~***`***~~fake-BIS~~***`plain```codblock `fakeinline` ```plain```codebloc
b2.5 ***~~fakeBIS~~***
```plain ***~~BIS~~***
plain
```
some code
```
caption
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
  type: ParserKey
): { frag: FragmentType | null; pre: string; post: string } => {
  // default result when no enter and exit match is found in the string, is {frag:null, pre: raw, post: ''};
  let frag = null;
  let pre = raw;
  let post = '';

  const reg = parserRules[type].regex;
  if (reg !== undefined) {
    const match = raw.match(reg);
    if (match && match.index !== undefined) {
      const startIndex = match.index;
      const matchingText = match[0];
      const endIndex = startIndex + matchingText.length;
      //@ts-ignore-error
      if (!parserRules[type].filter || parserRules[type].filter(matchingText)) {
        pre = raw.substr(0, startIndex);
        post = raw.substr(endIndex);
        frag = { [type]: matchingText } as FragmentType;
      }
    }
  } else {
    let startIndex: number;
    let startTokenLength: number = parserRules[type]
      .tokenLength as unknown as number;
    const startToken = parserRules[type].token;
    if (typeof startToken === 'string') {
      startIndex = raw.indexOf(startToken);
    } else if (typeof startToken === 'object') {
      // handle regex (for italics since * is a subset of bold's **)
      const possibleMatch = raw.match(startToken);
      startIndex =
        possibleMatch && possibleMatch.index !== undefined
          ? possibleMatch.index
          : -1;
      if (startIndex >= 0) {
        startTokenLength = possibleMatch?.[0].length ?? 0;
      }
    } else {
      throw new Error('should not be possible to reach this');
    }
    if (startIndex >= 0) {
      // we matched
      if (type === 'break') {
        pre = raw.substr(0, startIndex);
        post = raw.substr(startIndex + 1);
        frag = { break: null } as FragmentBreakType;
      } else {
        // see if we find an exit match
        const offset = startIndex + startTokenLength;
        const endToken = parserRules[type].ender || startToken;
        const endTokenLength = (parserRules[type].enderLength ||
          parserRules[type].tokenLength) as unknown as number;
        let stopIndex: number;
        if (typeof endToken === 'string') {
          stopIndex = raw.substr(offset).indexOf(endToken);
        } else {
          // handle regex (for italics since * is a subset of bold's **)
          const interimMatch = raw.substr(offset).match(endToken);
          stopIndex =
            interimMatch && interimMatch.index !== undefined
              ? interimMatch.index
              : -1;
        }
        if (stopIndex >= 0) {
          // there is an exit match
          const parsedIndex = offset + stopIndex + endTokenLength;
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
  snippetIndex: number,
  eaten: { frag: FragmentType | null; pre: string; post: string }
): any[] => {
  const arrPre = results.slice(0, snippetIndex);
  const arrPost = results.slice(snippetIndex + 1);
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
  //@ts-ignore-error
  let results: FragmentType[] = [input];

  const recursiveKeys = (Object.keys(parserRules) as ParserKey[]).filter(
    (k) => parserRules[k].recurse
  );
  const nonRecursiveKeys = (Object.keys(parserRules) as ParserKey[])
    .filter((k) => !parserRules[k].recurse)
    .sort(
      (a, b) => (parserRules[a].priority || 0) - (parserRules[b].priority || 0)
    );

  let snippet = input;
  let snippetIndex = 0;
  while (results.find((e) => typeof e === 'string')) {
    snippetIndex = results.findIndex((e) => typeof e === 'string');
    snippet = results[snippetIndex] as unknown as string;
    let matched = false;
    // handle the non-recursive types
    for (let ki = 0; ki < nonRecursiveKeys.length; ki++) {
      const key: ParserKey = nonRecursiveKeys[ki];
      if (!matched) {
        const eaten = eatSpecialType(snippet, key);
        if (eaten.frag) {
          results = updateResults(results, snippetIndex, eaten);
          matched = true;
        }
      }
    }
    // handle the recursive types
    // important that this happens AFTER the non-recursive types
    if (!matched) {
      const eats: any = {};
      for (let ki = 0; ki < recursiveKeys.length; ki++) {
        const key: ParserKey = recursiveKeys[ki];
        eats[key] = eatSpecialType(snippet, key);
      }
      // find the one that starts earliest in the snippet
      let smallest = 10000000;
      let smallestKey = null;
      for (let ki = 0; ki < recursiveKeys.length; ki++) {
        const key = recursiveKeys[ki];
        if (eats[key].frag && eats[key].pre.length < smallest) {
          smallest = eats[key].pre.length;
          smallestKey = key;
        }
      }
      if (smallestKey) {
        matched = true;
        // RECURSION HAPPENS HERE
        const innerFrags: any[] = parseChatInput(
          eats[smallestKey].frag[smallestKey]
        );
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
        const arrPre = results.slice(0, snippetIndex);
        const arrPost = results.slice(snippetIndex + 1);
        results = arrPre;
        results.push(eats[smallestKey].pre);
        for (let inneri = 0; inneri < innerFrags.length; inneri++) {
          results.push(innerFrags[inneri]);
        }
        results.push(eats[smallestKey].post);
        for (let arri = 0; arri < arrPost.length; arri++) {
          results.push(arrPost[arri]);
        }
      }
    }
    // fall-back to plain if nothing else matched
    if (!matched) {
      results[snippetIndex] = { plain: snippet } as FragmentPlainType;
    }
    //@ts-ignore
    results = results.filter((i) => i !== '');
  }
  //@ts-ignore
  return results;
};

export const convertFragmentsToPreview = (
  chatid: string | number,
  contents: FragmentType[]
) => {
  return (
    <span>
      {contents.map((content: FragmentType, idx: number) => {
        const type = Object.keys(content)[0] as FragmentKey;
        const value = content[type];
        if (type === 'break') {
          return <span key={`${chatid}-lastMessage-${idx}`}> </span>;
        } else if (TEXT_TYPES.includes(type) || type === 'link') {
          return <span key={`${chatid}-lastMessage-${idx}`}>{value}</span>;
        } else {
          return (
            <span
              style={{
                marginLeft: 2,
                marginRight: 2,
                fontStyle: 'italic',
              }}
              key={`${chatid}-lastMessage-${idx}`}
            >
              {type === 'code' ? 'code block' : type}
            </span>
          );
        }
      })}
    </span>
  );
};

export const convertFragmentsToText = (fragments: FragmentType[]): string => {
  return fragments.map((fragment) => fragmentToText(fragment)).join('');
};

export const fragmentToText = (fragment: FragmentType): string => {
  const [type, text] = Object.entries(fragment)[0];
  if (type === 'plain') return text;
  if (type === 'bold')
    return `${parserRules.bold.token}${text}${parserRules.bold.token}`;
  if (type === 'italics')
    return `${parserRules.italics.printToken}${text}${parserRules.italics.printToken}`;
  if (type === 'strike')
    return `${parserRules.strike.token}${text}${parserRules.strike.token}`;
  if (type === 'bold-italics') return `***${text}***`;
  if (type === 'bold-strike') return `**~~${text}~~**`;
  if (type === 'italics-strike') return `*~~${text}~~*`;
  if (type === 'bold-italics-strike') return `***~~${text}~~***`;
  if (type === 'blockquote')
    return `${parserRules.blockquote.printToken}${text}`;
  if (type === 'inline-code')
    return `${parserRules['inline-code'].token}${text}${parserRules['inline-code'].token}`;
  if (type === 'code')
    return `${parserRules.code.printToken}\n${text}${parserRules.code.printToken}`;
  if (type === 'break') return '\n';
  if (type === 'emoji') return `:\\u${text}:`;
  return text;
};
