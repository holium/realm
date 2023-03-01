import { Flex } from '@holium/design-system';
import CodeMirror from '@uiw/react-codemirror';

export function UqbarContractNode({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <CodeMirror
        value="::  nft.hoon [UQ| DAO]
::
::  NFT standard. Provides abilities similar to ERC-721 tokens, also ability
::  to deploy and mint new sets of tokens.
::
/+  *zig-sys-smart
/=  nft  /con/lib/nft
=,  nft
|_  =context
++  write
  |=  act=action:sur
  ^-  (quip call diff)
  ?-  -.act
    %give           (give:lib:nft context act)
    %take           (take:lib:nft context act)
    %set-allowance  (set-allowance:lib:nft context act)
    %mint           (mint:lib:nft context act)
    %deploy         (deploy:lib:nft context act)
  ==
::
++  read
  |_  =path
  ++  json
    ^-  ^json
    ?+    path  !!
        [%inspect @ ~]
      ?~  i=(scry-state (slav %ux i.t.path))  ~
      ?.  ?=(%& -.u.i)  ~
      ?^  item=((soft nft:sur:nft) noun.p.u.i)
        (nft:enjs:lib:nft u.item)
      ?^  meta=((soft metadata:sur:nft) noun.p.u.i)
        (metadata:enjs:lib:nft u.meta)
      ~
    ==
  ::
  ++  noun
    ~
  --
--"
      />
    </Flex>
  );
}
