# @holium/realm-presence

The JS lib for developers to use Realm's shared cursor feature set.

## Example usage

```tsx
import { Clickable } from '@holium/realm-multiplayer';

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
