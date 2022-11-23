import { Text, GroupLink } from 'renderer/components';
import { AppLink } from 'renderer/components/Embeds/AppLink';
import { TextParsed } from '../components/TextContent';
import { cleanNounColor } from 'os/lib/color';
import { ShipActions } from 'renderer/logic/actions/ship';

export const getTextFromContent = (type: string, content: any) => {
  if (type === 'reference') {
    return getReferenceData(content.reference);
  } else {
    return content[type];
  }
};

export const getReferenceView = async (
  reference: any,
  embedColor?: string,
  textColor?: string
) => {
  const referenceType: any = Object.keys(reference)[0];
  switch (referenceType) {
    case 'group':
      ShipActions.getMetadata(
        `${reference.group}/groups${reference.group}`
      ).then((response: any) => {
        if (response) {
          return (
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
          return (
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
      return (
        <GroupLink
          bgColor={embedColor}
          textColor={textColor}
          loading
          title=""
          description=""
          color=""
        />
      );

    case 'app':
      // TODO reimplement
      // ShipActions.getAppPreview(reference.app.ship, reference.app.desk).then(
      //   (response: any) => {
      //     return (
      //       <AppLink
      //         {...response}
      //         textColor={textColor}
      //         bgColor={embedColor}
      //         color={response.color ? cleanNounColor(response.color) : null}
      //       />
      //     );
      //   }
      // );
      return (
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
    case 'code':
      return <Text fontSize={2}>{reference.code.expression}</Text>;
    case 'graph':
      return <Text fontSize={2}>{reference.graph.graph}</Text>;
    default:
      return <TextParsed content={reference[referenceType]} />;
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
