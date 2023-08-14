export const SUPPORT_EMAIL_ADDRESS = 'support@holium.com'; // Goes to same place as bugs@holium.com.

export const getSupportMailTo = (
  patp: string | undefined,
  subject: 'REALM issue' | 'HOSTING issue' | 'REALM UPDATER issue'
) =>
  `mailto:${SUPPORT_EMAIL_ADDRESS}?subject=${subject}${
    patp ? ` for ${patp}` : ''
  }&body=Remember, a picture is worth a thousand words. Please attach ANY screenshot that may help us understand your issue. Thank you!`;
