import { useState } from 'react';
import styled from 'styled-components';

import EditProfilePage from './edit';
import { ContactInfo, PassportProfile } from 'lib/types';

import {
  ChatIcon,
  DuplicateIcon,
  FollowIcon,
  PhoneIcon,
  UsersIcon,
} from '../../assets/icons';

import {
  Avatar,
  DisplayName,
  PatpLabel,
  SocialButton,
  ActionButton,
} from '../../assets/styled';

interface ContactCardProps {
  contact: ContactInfo;
}

function ContactCard({ contact }: ContactCardProps) {
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
        <div style={{ color: '#333333', marginTop: '4px' }}>{contact.bio}</div>
      </div>
    </>
  );
}

interface ProfilePageProps {
  canEdit: boolean;
  profile: PassportProfile;
}

export default function ViewProfilePage({
  canEdit,
  profile,
}: ProfilePageProps) {
  const [editing, setEditing] = useState<boolean>(false);
  const onClickEdit = () => {
    setEditing(true);
  };
  return editing ? (
    <EditProfilePage />
  ) : (
    <>
      <h1>This is the profile page</h1>
      {canEdit && <button onClick={onClickEdit}>Edit</button>}
      <ContactCard contact={profile.contact} />
    </>
  );
}
