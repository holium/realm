import { ChatIcon, FollowIcon, PhoneIcon } from '@/app/assets/icons';
import {
  ActionButton,
  Avatar,
  DisplayName,
  PatpLabel,
  SocialButton,
} from '@/app/assets/styled';
import { ContactInfo } from '@/app/lib/types';

interface ContactCardProps {
  contact: ContactInfo;
}

export default function ContactCard({ contact }: ContactCardProps) {
  return (
    <>
      {contact.avatar && <Avatar src={contact.avatar.uri}></Avatar>}
      {contact['display-name'] && (
        <DisplayName>{contact['display-name']}</DisplayName>
      )}
      <PatpLabel>{contact.ship}</PatpLabel>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <SocialButton>Follow</SocialButton>
        <div style={{ width: '10px' }}></div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
          }}
        >
          <ActionButton>
            <FollowIcon />
          </ActionButton>
          <ActionButton>
            <ChatIcon />
          </ActionButton>
          <ActionButton>
            <PhoneIcon />
          </ActionButton>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            marginTop: '8px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: '#333333',
              opacity: '0.4',
            }}
          >
            Bio
          </div>
          <hr
            style={{
              // color: '#333333',
              marginLeft: '8px',
              backgroundColor: '#333333',
              width: '100%',
              height: '1px',
              border: 0,
              opacity: '10%',
            }}
          />
        </div>
        <div
          style={{ color: '#333333', marginTop: '4px', marginBottom: '8px' }}
        >
          {contact.bio}
        </div>
      </div>
    </>
  );
}
