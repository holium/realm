# @holium/realm-presence

The JS lib for developers to use Realm's shared cursor feature set.

## Examples

There are two ways to use this library, one is by wrapping elements in the `Interactive` component, and the other is by using the `useBroadcast` hook.

### 1. Make elements interactive

If you want to make an element in your app interactable by other Realm users, you can wrap it with the `Interactive` component (it will merge its props into its first child, following the Radix Slot pattern).

```tsx
import { Interactive } from '@holium/realm-presence';

export const App = () => {
  const onClick = (_: React.MouseEvent) => {
    console.log('Protagonist clicked the button');
  };

  const onOtherClick = (patp: string) => {
    console.log(patp, 'clicked the button!');
  };

  return (
    <Interactive id="fill" onClick={onClick} onOtherClick={onOtherClick}>
      <button>Submit</button>
    </Interactive>
  );
};
```

### 2. Broadcast arbitrary data

If you want to broadcast any arbitrary type of data to other Realm users, you can use the `useBroadcast` hook. Pass the hook a unique `channelId` and an `onBroadcast` callback to handle incoming broadcasts, and it will return a typed `broadcast` function that you can use to send data to other users.

```tsx
import { useBroadcast } from '@holium/realm-presence';

export const App = () => {
  const onBroadcast = (patp: string, type: string, value: any) => {
    console.log('Received broadcast!', patp, type, value);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    broadcast('zod', 'input', e.target.value);
  };

  const { broadcast } = useBroadcast({
    channelId: 'my-channel',
    onBroadcast
  });

  return <input onChange={onChange} />;
};
```
