/-  c=chat
/-  cor=courier-chat
=>
  |%
  ++  card  card:agent:gall
  --
::
|_  =bowl:gall
::
++  previews
  |%
  ++  list
    |=  [=bowl:gall]
    :: ^-  (list preview:cor)
      :: Get DMs from x/briefs scy
    ~&  >  [bowl]
    =/  =briefs:c    .^(briefs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/briefs/noun)
      :: Get invited DMs from x/dm/invited scy
    :: prevs
    ~
  ::
  ++  scry
    |%
    ++  briefs
      |=  [=bowl:gall =path]
      ^-  briefs:c
      .^(briefs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/briefs/noun)      
    --
  --
::
::
:: ++  chats
::   |%
::   :: ++  scry
::   ::   |=  [=bowl:gall =path]
::   ::   ^-  (unit @)
::   ::   =/  =path  /(scot %p our.bowl)/chat/(scot %da now.bowl)/path
::   ::   .^(@ %gx path)
::   ::
::   --
--