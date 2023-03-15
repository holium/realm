# @holium/realm-presence

The JS lib for developers to use Realm's shared cursor feature set.

## Example usage #1

If you want to make an element in your app interactable by other users, you can wrap it with the `Interactive` component (it will merge its props into its first child, following the Radix Slot pattern).

```tsx
import { Interactive } from '@holium/realm-presence';

export const App = () => {
  const onOtherClick = (patp: string) => {
    console.log(patp, 'clicked the button!');
  };

  return (
    <Interactive id="fill" onOtherClick={onOtherClick}>
      <button>
        Submit
      </Button>
    </button>
  );
};
```

## Example usage #2

If you want to broadcast an type of data to other users, you can use the `useBroadcast` hook.

```tsx
import { useBroadcast } from '@holium/realm-presence';

export const App = () => {
  const onBroadcast = (patp: string, type: string, value: any) => {
    console.log('Received broadcast!', patp, type, value);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    broadcast('zod', 'input', e.target.value);
  };

  const { broadcast } = useBroadcast({ onBroadcast });

  return <input onChange={onChange} />;
};
```
