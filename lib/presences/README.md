<<<<<<<< HEAD:lib/presence/README.md
# @holium/realm-presence
========
# @holium/realm-presences
>>>>>>>> ad5ea19f (Rename multiplayer to presences):lib/presences/README.md

The JS lib for developers to use Realm's shared cursor feature set.

## Example usage

```tsx
import { Interactive } from '@holium/realm-presences';

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
