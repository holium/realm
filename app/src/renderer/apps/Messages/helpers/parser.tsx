import { toJS } from 'mobx';
import { Text, GroupLink } from 'renderer/components';
import { AppLink } from 'renderer/components/Embeds/AppLink';
import { TextParsed } from '../components/TextContent';
import { cleanNounColor } from 'os/lib/color';

export const getTextFromContent = (type: string, content: any) => {
  if (type === 'reference') {
    return getReferenceData(content.reference);
  } else {
    return content[type];
  }
};

export const getReferenceView = async (
  reference: any,
  setter: any,
  embedColor?: string,
  textColor?: string
) => {
  const referenceType: any = Object.keys(reference)[0];
  switch (referenceType) {
    case 'group':
      window.electron.os.ship
        .getMetadata(`${reference.group}/groups${reference.group}`)
        .then((response: any) => {
          if (response) {
            setter(
              <GroupLink
                {...response.metadata}
                textColor={textColor}
                bgColor={embedColor}
                description={null}
                color={
                  response.metadata.color
                    ? cleanNounColor(response.metadata.color)
                    : null
                }
              />
            );
          } else {
            setter(
              <GroupLink
                textColor={textColor}
                bgColor={embedColor}
                title={reference.group.replace('/ship/', '')}
                description="Could not load metadata"
                color="#a1a1a1"
              />
            );
          }
        });
      setter(
        <GroupLink
          bgColor={embedColor}
          textColor={textColor}
          loading
          title=""
          description=""
          color=""
        />
      );

      break;
    case 'app':
      window.electron.os.ship
        .getAppPreview(reference.app.ship, reference.app.desk)
        .then((response: any) => {
          setter(
            <AppLink
              {...response}
              textColor={textColor}
              bgColor={embedColor}
              color={response.color ? cleanNounColor(response.color) : null}
            />
          );
        });
      setter(
        <AppLink
          bgColor={embedColor}
          textColor={textColor}
          loading
          title=""
          info=""
          ship=""
          version=""
          color=""
        />
      );
      break;
    case 'code':
      setter(<Text fontSize={2}>{reference.code.expression}</Text>);
      break;
    case 'graph':
      setter(<Text fontSize={2}>{reference.graph.graph}</Text>);
      break;
    default:
      setter(<TextParsed content={reference[referenceType]} />);
      break;
  }
};

export const getReferenceData = (reference: any) => {
  const referenceType: any = Object.keys(reference)[0];
  let text: string = '';
  switch (referenceType) {
    case 'group':
      text = reference.group;
      break;
    case 'app':
      text = reference.app.desk;
      break;
    case 'code':
      text = reference.code.expression;
      break;
    case 'graph':
      text = reference.graph.graph;
      break;
    default:
      text = reference[referenceType];
      break;
  }
  return text;
};
