declare module 'ships.json' {
  const value: Record<
    string,
    {
      ship: string;
      url: string;
      code: string;
    }
  >;
  export default value;
}
