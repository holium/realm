::  courier [realm]:
::
::  Chat message lib within Realm. Mostly handles [de]serialization
::    to/from json from types stored in courier sur.
::
/-  sur=courier, gra=graph-store, *post, *resource, contact-store, dm-hook
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
    ::  Get dms
    =/  dm-inbox          .^(update:gra %gx /(scot %p our)/graph-store/(scot %da now)/graph/(scot %p our)/dm-inbox/noun)
    ?>  ?=(%add-graph -.+.dm-inbox)
    =/  dm-graph          ^-((map atom node:gra) graph.+.+.dm-inbox)
    =/  rolo              .^(rolodex:sur %gx /(scot %p our)/contact-store/(scot %da now)/all/noun)
    =/  prev-list=(list message-preview)
    %+  turn  ~(tap by dm-graph)
      |=  [ship-dec=atom node=node:gra]
      (form-chat-prev ship-dec node our rolo)
    ::  Get pending dms
    =/  pendings       .^(action:dm-hook %gx /(scot %p our)/dm-hook/(scot %da now)/pendings/noun)
    ?>  ?=(%pendings -.pendings)
    =/  pen-ships      `(set @p)`ships.+.pendings
    =/  pen-list=(list message-preview)
    %+  turn  ~(tap in pen-ships)
      |=  ship=@p
      (form-pending ship now rolo)      
    :: todo sort by last-sent
    [(weld prev-list pen-list)]
  ::
  ++  form-chat-prev
    |=  [ship-dec=atom node=node:gra our=ship rolo=rolodex:sur]
    ^-  message-preview
    =/  to-ship           ^-(@p ship-dec)
    ?>  ?=(%graph -.children.node)
    =/  message-nodes     p.+.children.node
    =/  post-graph        ^-((map atom node:gra) message-nodes)
    =/  posts=(list post:gra)
      %+  turn  ~(tap by post-graph)
        |=  [ship-dec=atom node=node:gra]
        ?<  ?=(%| -.post.node)
        =/  p     ^-(post p.post.node)
        [p]
    :: =/  last  (rear (skim posts |=(p=post:gra ?:(=(author.p to-ship) %.y %.n))))
    =/  last  (rear posts)
    [to-ship %dm %graph-store time-sent.last contents.last (form-contact-mtd rolo to-ship)]
  ::
  ++  form-pending
    |=  [=ship now=@da rolo=rolodex:sur]
    ^-  message-preview
    [ship %pending %graph-store now [~] (form-contact-mtd rolo ship)]
  ::
  ++  gen-dms
    |=  [our=ship to-ship=ship now=@da]
    =/  ship-dec            `@ud`to-ship
    ::  first get dm-inbox to get total node count
    =/  dm-inbox            .^(update:gra %gx /(scot %p our)/graph-store/(scot %da now)/graph/(scot %p our)/dm-inbox/noun)
    ?>  ?=(%add-graph -.+.dm-inbox)
    =/  dm-graph            `(map @ud node:gra)`graph.+.+.dm-inbox
    ::  TODO for some reason the got by wont find certain @ud keys but will if listified (need to find way to typecast map keys)
    ::
    =/  dms-list            ~(tap by dm-graph)  
    =/  to-dms              (skim `(list [@ud node:gra])`dms-list |=(a=[@ud node:gra] (skim-dms a ship-dec)))
    =/  ship-dms            (snag 0 to-dms)
    ::  
    :: =/  to-dms              (~(got by dm-graph) `@ud`ship-dec)
    ?>  ?=(%graph -.children.+.ship-dms)
    =/  dm-posts            ^-((map atom node:gra) p.+.children.+.ship-dms)
    =/  dms                 (map-to-dms dm-posts)
    :: ::  TODO The below is not optimal, but need to keep moving
    =/  rolo                .^(rolodex:sur %gx /(scot %p our)/contact-store/(scot %da now)/all/noun)
    ^-(chat [to-ship %dm %graph-store (flop dms) (form-contact-mtd rolo to-ship)])
  ::
  ++  gen-received-dm
    |=  [ship-dec=@ud idx=atom =node:gra our=ship now=@da]
    =/  to-ship       ^-(@p `@p`ship-dec)
    =/  message       (node-to-dm idx node)
    ::  for now we are going to include the contact data in a newly received dm
    ::  because it could possibly be a new dm and am not sure how to check for 
    ::  this yet
    =/  rolo          .^(rolodex:sur %gx /(scot %p our)/contact-store/(scot %da now)/all/noun)
    ^-(chat [to-ship %dm %graph-store [message ~] (form-contact-mtd rolo to-ship)])

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
    :: =/  id      (index-to-str `index`idx)
    [(scot %u idx) author.p time-sent.p contents.p]
  ::
  ++  index-to-str
    |=  ind=^index
    ?:  =(~ ind)
      '/'
    %+  roll  ind
    |=  [cur=@ acc=@t]
    ^-  @t
    =/  num  ^-(@u `@u`cur)
    (rap 3 acc '/' num ~)
  ::
  ++  skim-dms
    |=  [el=[ship-dec=@ud node=node:gra] key-dec=@ud]
    =(ship-dec.el key-dec)
  --

::
::  JSON
::
++  enjs
  =,  enjs:format
  |%
  ++  reaction :: encodes for on-watch
    |=  vi=reaction:sur
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.vi
    ?-  -.vi
      :: ::
        %previews
      (chat-previews:encode chat-previews.vi)
      ::
        %dm-received
      (dm-log:encode chat.vi)
    ==
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