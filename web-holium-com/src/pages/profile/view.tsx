import { useState } from 'react';

interface ProfilePageProps {
  canEdit: boolean;
}

export default function ViewProfilePage({ canEdit }: ProfilePageProps) {
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
    </>
  );
}
