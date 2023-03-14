<<<<<<<< HEAD:lib/presence/README.md
# @holium/realm-presence
========
# @holium/realm-presences
>>>>>>>> ad5ea19f (Rename multiplayer to presences):lib/presences/README.md

The JS lib for developers to use Realm's shared cursor feature set.

## Example usage

```tsx
import { Clickable } from '@holium/realm-presences';

export const App = () => {
  const onClick = () => {
    console.log('Clicked');
  };

  return (
    <Clickable id="fill" onClick={onClick} onOtherClick={onClick}>
      <button>
        Submit
      </Button>
    </button>
  );
};
```
