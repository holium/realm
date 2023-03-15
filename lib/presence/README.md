# @holium/realm-presence

The JS lib for developers to use Realm's shared cursor feature set.

## Example usage

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
