import { createUrl } from './createUrl';

describe('createUrl', () => {
  it('should return the same query if it is a valid URL', () => {
    const url = 'https://www.neeva.com';

    expect(createUrl(url)).toEqual(url);
  });
  it('should add secure protocol to valid URLs', () => {
    const url = 'www.neeva.com';

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
  it('should return all other queries as a neeva search', () => {
    const query = 'blabla';
    const url = `https://neeva.com/search?q=${query}`;

    expect(createUrl(query)).toEqual(url);
  });
});
