/-  store=spaces-store, mstore=membership, visas, chat-db
/-  cstore=spaces-chat
/+  memb-lib=membership, rc-lib=realm-chat
=<  [store .]
=,  store
|%
++  pathify-space-path
  |=  =space-path:store
  ^-  path
  /(scot %p ship.space-path)/(wood space.space-path)
:: TODO make this smart enough to actually do different logic based on
:: the value of `chat-access`, instead of just always doing the logic
:: for [%role %member]
++  create-space-chat
  |=  [=space:store =chat-access:cstore =members:mstore t=@da]
  ^-  (quip card:agent:gall chat:cstore)
  ::  spaces chats path format: /spaces/<space-path>/chats/<@uv>
  =/  chat-path  (weld /spaces (weld (pathify-space-path path.space) /chats/(scot %uv (sham path.space))))
  =/  metadata-settings
    :~  ['image' '']
        ['title' 'General']
        ['description' '']
        ['creator' (scot %p ship.path.space)]
        ['reactions' 'true']
        ['space' (spat (pathify-space-path path.space))]
    ==
  =/  metadata=(map cord cord)   (~(gas by *(map cord cord)) metadata-settings)
  =/  pathrow=path-row:chat-db  [chat-path metadata %space t t ~ %host %.n *@dr]
  =/  all-peers=ship-roles:chat-db
    ::?+  -.chat-access  !! :: default crash not-implemented an access type
    ::  %members
        %+  turn
          %+  skim
            ~(tap by members)
          |=  kv=[k=ship v=member:mstore]
          :: matching members are status %joined or %host AND have
          :: either %member or %owner roles
          ?&  |(=(status.v.kv %joined) =(status.v.kv %host))
              |((~(has in roles.v.kv) %member) (~(has in roles.v.kv) %owner))
          ==
        |=  kv=[k=ship v=member:mstore]
        [k.kv ?:(=(status.v.kv %host) %host %member)]
      :: TODO logic for peers lists for %admins %invited %whitelist and %blacklist
    ::==
  ~&  >>>  all-peers
  =/  cards
    %+  turn
      all-peers
    |=  [s=ship role=@tas]
    (create-path-db-poke:rc-lib s pathrow all-peers)
    
  =/  new-chat      [chat-path chat-access]
  [cards new-chat]

::  creates the necessary cards for poking %chat-db to add the new ship
::  to all the relevant chats it should be added to
:: ++  add-ship-to-matching-chats
::   |=  [=ship =member:mstore =space:store =bowl:gall]
::   ^-  (list card:agent:gall)
::   %-  zing
::   %+  turn
::     ~(tap by chats.space)
::   |=  kv=[k=path v=chat:store]
::   ^-  (list card:agent:gall)
::   ?+  -.access.v.kv  ~ :: TODO handle other modes of chat access
::     %role
::       ?.  &((~(has in roles.member) role.access.v.kv) |(=(%joined status.member) =(%host status.member)))  ~
::       =/  pathpeers   (scry-peers:rc-lib k.kv bowl)
::       =/  matches     (skim pathpeers |=(p=peer-row:chat-db =(patp.p ship)))
::       ?:  (gth (lent matches) 0)  ~  :: this ship is already in this chat, so no need to add them
::       [%pass /rcpoke %agent [our.bowl %realm-chat] %poke %chat-action !>([%add-ship-to-chat k.kv ship])]~
::   ==

:: ::  creates the necessary cards for poking %chat-db to remove the new ship
:: ::  to all chats within the space
:: ++  remove-ship-from-space-chats
::   |=  [=ship =space:store =bowl:gall]
::   ^-  (list card:agent:gall)
::   %-  zing
::   %+  turn
::     ~(tap by chats.space)
::   |=  kv=[k=path v=chat:store]
::   ^-  (list card:agent:gall)
::   [%pass /rcpoke %agent [our.bowl %realm-chat] %poke %chat-action !>([%remove-ship-from-chat k.kv ship])]~

--