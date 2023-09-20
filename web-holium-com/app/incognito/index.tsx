interface IncognitoPageProps {
  patp: string;
}

export default function IncognitoPage({ patp }: IncognitoPageProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {patp} does not want to be found
    </div>
  );
}
