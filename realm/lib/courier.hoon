::  courier [realm]:
::
::  Chat message lib within Realm. Mostly handles [de]serialization
::    to/from json from types stored in courier sur.
::
/-  sur=courier, gra=graph-store, *post, *resource, contact-store
/+  res=resource
=<  [sur .]
=,  sur
|%
::
++  gs-dms          ::  converts dms from graph-store dm-inbox
  |%
  ++  gen-list      :: a list of contacts with last message
    |=  [our=ship now=@da]
    ^-  (list message-preview)
    =/  dm-inbox          .^(update:gra %gx /(scot %p our)/graph-store/(scot %da now)/graph/(scot %p our)/dm-inbox/noun)
    ?>  ?=(%add-graph -.+.dm-inbox)
    =/  dm-graph          ^-((map atom node:gra) graph.+.+.dm-inbox)
    =/  rolo              .^(rolodex:sur %gx /(scot %p our)/contact-store/(scot %da now)/all/noun)
    =/  prev-list=(list message-preview)
    %+  turn  ~(tap by dm-graph)
      |=  [ship-dec=atom node=node:gra]
      (form-chat-prev ship-dec node our rolo)
    :: todo sort by last-sent
    [prev-list]
  ::
  ++  form-chat-prev
    |=  [ship-dec=atom node=node:gra our=ship rolo=rolodex:sur]
    ^-  message-preview
    =/  to-ship           ^-(@p ship-dec)
    =/  path              (spat /courier/dms/(scot %p to-ship))
    ?>  ?=(%graph -.children.node)
    =/  message-nodes     p.+.children.node
    =/  post-graph        ^-((map atom node:gra) message-nodes)
    =/  posts=(list post:gra)
      %+  turn  ~(tap by post-graph)
        |=  [ship-dec=atom node=node:gra]
        ?<  ?=(%| -.post.node)
        =/  p     ^-(post p.post.node)
        [p]
    =/  last  (rear posts)
    ^-(message-preview [path to-ship %dm %graph-store time-sent.last contents.last (form-contact-mtd rolo to-ship)])
  ::
  ++  gen-dms
    |=  [our=ship to-ship=ship now=@da]
    =/  ship-dec            ^-(@u `@u`to-ship)
    ::  first get dm-inbox to get total node count
    =/  dm-inbox            .^(update:gra %gx /(scot %p our)/graph-store/(scot %da now)/graph/(scot %p our)/dm-inbox/noun)
    ?>  ?=(%add-graph -.+.dm-inbox)
    =/  path                (spat /courier/chat/(scot %p to-ship))
    =/  dm-graph            ^-((map atom node:gra) graph.+.+.dm-inbox)
    =/  to-dms              (~(got by dm-graph) ship-dec)
    ?>  ?=(%graph -.children.to-dms)
    =/  dm-posts            ^-((map atom node:gra) p.+.children.to-dms)
    =/  dms                 (map-to-dms dm-posts)
    ::  TODO The below is not optimal, but need to keep moving
    =/  rolo                .^(rolodex:sur %gx /(scot %p our)/contact-store/(scot %da now)/all/noun)
    ^-(chat [path to-ship %dm %graph-store (flop dms) (form-contact-mtd rolo to-ship)])
  ::
  ++  form-contact-mtd
    |=  [rolo=rolodex:sur =ship]
    ^-  contact-mtd:sur
    =/  mtd       (~(get by rolo) ship)
    =/  avatar=(unit @t)
      ?~  mtd  (some '')
      avatar.u.mtd
    =/  color=@ux
      ?~  mtd  `@ux`(scan "0" hex:ag)
      color.u.mtd
    =/  nickname=@t
      ?~  mtd  ''
      nickname.u.mtd
    [color avatar nickname]
  ::
  ++  map-to-dms
    |=  [dm-posts=(map atom node:gra)]
    =/  dms=(list graph-dm:sur)
    %+  turn  ~(tap by dm-posts)
      |=  [idx=atom node=node:gra]
      (node-to-dm idx node)
    dms
  ::
  ++  node-to-dm
    |=  [idx=atom node=node:gra]
    ^-  graph-dm:sur
    ?<  ?=(%| -.post.node)
    =/  p         ^-(post p.post.node)
    :: =/  idx-str   (index-to-str idx)
    [(scot %u idx) author.p time-sent.p contents.p]
  
  ++  index-to-str
    |=  ind=^index
    ?:  =(~ ind)
      '/'
    %+  roll  ind
    |=  [cur=@ acc=@t]
    ^-  @t
    =/  num  ^-(@u `@u`cur)
    (rap 3 acc '/' num ~) 
  --

::
::  JSON
::
++  enjs
  =,  enjs:format
  |%
  ++  view :: encodes for on-peek
    |=  vi=view:sur
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.vi
    ?-  -.vi
      :: ::
        %inbox
      (chat-previews:encode chat-previews.vi)
      ::
        %dm-log
      (dm-log:encode chat.vi)
    ==
  --
::
++  encode
  =,  enjs:format
  |%
  ++  chat-previews
    |=  list-view=(list message-preview)
    ^-  json
    %-  pairs
    %+  turn  list-view
      |=  cha=message-preview
      [(scot %p to.cha) (preview cha)]
  ::
  ++  preview
    |=  cha=message-preview
    ^-  json
    %-  pairs
    :~  
        ['path' s+path.cha]
        ['to' s+(scot %p to.cha)]
        ['type' s+(scot %tas type.cha)]
        ['source' s+(scot %tas source.cha)]
        ['lastTimeSent' (time last-time-sent.cha)]
        ['lastMessage' a+(turn last-message.cha content)]
        ['metadata' (mtd metadata.cha)]
    ==
  ::
  ++  dm-log
    |=  cha=chat
    ^-  json
    %-  pairs
    :~ 
      ['path' s+path.cha]
      ['to' s+(scot %p to.cha)]
      ['type' s+(scot %tas type.cha)]
      ['source' s+(scot %tas source.cha)]
      ['messages' a+(turn messages.cha graph-dm)]
      ['metadata' (mtd metadata.cha)]
    ==
  ::
  ++  mtd
    |=  mtd=contact-mtd:sur
    ^-  json
    %-  pairs
    :~ 
        ['avatar' ?~(avatar.mtd ~ s+u.avatar.mtd)]
        ['nickname' s+nickname.mtd]
        ['color' s+(scot %ux color.mtd)]
    ==
  ++  index
    |=  ind=^index
    ^-  json
    :-  %s
    ?:  =(~ ind)
      '/'
    %+  roll  ind
    |=  [cur=@ acc=@t]
    ^-  @t
    =/  num  (numb cur)
    ?>  ?=(%n -.num)
    (rap 3 acc '/' p.num ~) 
  ::
  ++  content
    |=  c=^content
    ^-  json
    ?-  -.c
        %mention    (frond %mention s+(scot %p ship.c))
        %text       (frond %text s+text.c)
        %url        (frond %url s+url.c)
        %reference  (frond %reference s+'')
        %code
      %+  frond  %code
      %-  pairs
      :-  [%expression s+expression.c]
      :_  ~
      :-  %output
      ::  virtualize output rendering, +tank:enjs:format might crash
      ::
      =/  result=(each (list json) tang)
        (mule |.((turn output.c tank)))
      ?-  -.result
        %&  a+p.result
        %|  a+[a+[%s '[[output rendering error]]']~]~
      ==
    ==
  ++  graph-dm
    |=  dm=^graph-dm
    ^-  json
    %-  pairs
    :~ 
        ['index' s+index.dm]
        ['author' s+(scot %p author.dm)]
        ['timeSent' (time time-sent.dm)]
        ['contents' a+(turn contents.dm content)]
    ==
  ::
  :: ++  reference
  ::   |=  ref=^reference
  ::   |^
  ::   %+  frond  -.ref
  ::   ?-  -.ref
  ::     %graph  (graph +.ref)
  ::     %group  (group +.ref)
  ::     %app    (app +.ref)
  ::   ==
  ::   ::
  ::   ++  graph
  ::     |=  [grp=res gra=res idx=^index]
  ::     %-  pairs
  ::     :~  graph+s+(enjs-path:res gra)
  ::         group+s+(enjs-path:res grp)
  ::         index+(index idx)
  ::     ==
  ::   ::
  ::   ++  group
  ::     |=  grp=res
  ::     s+(enjs-path:res grp)
  ::   ::
  ::   ++  app
  ::     |=  [=^ship =desk p=^path]
  ::     %-  pairs
  ::     :~  ship+s+(scot %p ship)
  ::         desk+s+desk
  ::         path+(path p)
  ::     ==
  ::   --
  ::
  --
  ::
--