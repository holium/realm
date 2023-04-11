import { createUrl } from './createUrl';

describe('createUrl', () => {
  it('should return the same query if it is a valid URL', () => {
    const url = 'https://www.duckduckgo.com';

    expect(createUrl(url)).toEqual(url);
  });
  it('should add secure protocol to valid URLs', () => {
    const url = 'www.duckduckgo.com';

    expect(createUrl(url)).toEqual(`https://${url}`);
  });
  it('should add unsafe protocol to local URLs', () => {
    const url = 'localhost:3000';

    expect(createUrl(url)).toEqual(`http://${url}`);
  });
  it('should add unsafe protocol to IP addresses', () => {
    const url = '123.123.12.12';

    expect(createUrl(url)).toEqual(`http://${url}`);
  });
  it('should return all other queries as a duckduckgo search', () => {
    const query = 'blabla';
    const url = `https://duckduckgo.com/?q=${query}`;

    expect(createUrl(query)).toEqual(url);
  });
});
