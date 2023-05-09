type Styles = Record<string, string>;

declare module '*.svg' {
  const content: string;
  export default content;
}
