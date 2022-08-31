::  courier [realm]:
::
::  Chat message lib within Realm. Mostly handles [de]serialization
::    to/from json from types stored in courier sur.
::
/-  sur=courier, gra=graph-store, *post, *resource, contact-store, dm-hook, mtd=metadata-store
/+  res=resource
=<  [sur .]
=,  sur
|%
::
+$  g-pth     [@p cord]
+$  g-list    (list g-pth)
::
++  gs          ::  converts dms from graph-store dm-inbox
  |%
  ::
  ::  DM list handlers
  :: 
  ++  previews      :: a list of contacts with last message
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
      (form-dm-prevs ship-dec node our rolo)
    ::  Get pending dms
    =/  pendings       .^(action:dm-hook %gx /(scot %p our)/dm-hook/(scot %da now)/pendings/noun)
    ?>  ?=(%pendings -.pendings)
    =/  pen-ships      `(set @p)`ships.+.pendings
    =/  pen-list=(list message-preview)
    %+  turn  ~(tap in pen-ships)
      |=  ship=@p
      (form-pending ship now rolo)
    :: todo sort by last-sent
    =/  single-dms      (weld prev-list pen-list)
    =/  group-dms       (grp-dm-prevs our now rolo)
    [(weld single-dms group-dms)]
  ::
  ::  Performs all the scries needed to build a group dm preview for the list view
  ::
  ++  grp-dm-prevs
    |=  [our=ship now=@da rolo=rolodex:sur]
    ^-  (list message-preview)
    =/  assoc          .^(associations:mtd %gx /(scot %p our)/metadata-store/(scot %da now)/associations/noun)
    =/  group-dms      (skim ~(val by assoc) skim-grp-dms)
    =/  dms-list=(list message-preview)
    %+  turn  group-dms
      |=  ass=association:mtd
      (grp-prev our ass now rolo)
    dms-list
    ::
    ++  grp-prev
      |=  [our=ship ass=association:mtd now=@da rolo=rolodex:sur]
      ^-  message-preview
      =/  glog          (glog our entity.group.ass name.group.ass now)

      ::  get contact metadata set
      =/  mtd-set=(list contact-mtd)
      %+  turn  ~(tap in to.glog)
        |=  cont=@p
        (form-contact-mtd rolo cont)
      ::
      ?:  =(0 ~(wyt by posts.glog))    :: if theres no data, return empty preview
        [path.glog to.glog %group %graph-store time.glog [~] (silt mtd-set)]
      ::
      =/  posts=(list post:gra)
      %+  turn  ~(val by posts.glog)
        |=  [node=node:gra]
        ?<  ?=(%| -.post.node)
        =/  p     ^-(post p.post.node)
        [p]
      ::  Get the last post
      =/  last              (rear posts)
      ::  Add a mention so we know who posted the last message
      =/  contents          (weld [[%mention author.last] ~] contents.last)
      [path.glog to.glog %group %graph-store time-sent.last contents (silt mtd-set)]
  ::
  ::
  ++  grp-log
    |=  [our=ship now=@da entity=ship name=cord]
    ^-  chat
    =/  glog            (glog our entity name now)
    =/  rolo            .^(rolodex:sur %gx /(scot %p our)/contact-store/(scot %da now)/all/noun)
    =/  mtd-set=(list contact-mtd)
      %+  turn  ~(tap in to.glog)
        |=  cont=@p
        (form-contact-mtd rolo cont)
    ::
    ?:  =(0 ~(wyt by posts.glog))    :: if theres no data, return empty preview
      [path.glog to.glog %group %graph-store [~] (silt mtd-set)]
    ::
    =/  dms               (map-to-dms posts.glog)
    [path.glog to.glog %group %graph-store (flop dms) (silt mtd-set)]
  ::
  ++  glog
    |=  [our=ship entity=ship name=term now=@da]
    ^-  [time=@da path=cord to=(set ship) posts=(map atom node:gra)]
    =/  dm-name         (need (slaw %da name))
    =/  group-name      `cord`name
    =/  group           (need .^((unit group) %gx /(scot %p our)/group-store/(scot %da now)/groups/ship/(scot %p entity)/(cord group-name)/noun))
    =/  group-path      (spat /(scot %p entity)/(cord group-name))
    ?>  ?=(%invite -.policy.group)
    =/  to-set          (~(gas in members.group) ~(tap in pending.policy.group))
    =/  node            .^(update:gra %gx /(scot %p our)/graph-store/(scot %da now)/graph/(scot %p entity)/(scot %da dm-name)/noun)   
    ?>  ?=(%add-graph -.+.node)
    =/  post-graph       ^-((map atom node:gra) graph.+.+.node)
    [dm-name group-path to-set post-graph]
  ::
  ++  skim-grp-dms
    |=  ass=association:mtd
    ?:  =(%graph -.config.metadatum.ass)
      =/  name      `cord`name.group.ass
      =/  name-da   (slaw %da name)
      ?~  name-da   %.n   %.y
    %.n
  ::
  ::  forms a single dm preview for the list view
  ::
  ++  form-dm-prevs
    |=  [ship-dec=atom node=node:gra our=ship rolo=rolodex:sur]
    ^-  message-preview
    =/  to-ship           ^-(@p ship-dec)
    ?>  ?=(%graph -.children.node)
    =/  message-nodes     p.+.children.node
    =/  post-graph        ^-((map atom node:gra) message-nodes)
    :: Get all posts
    =/  posts=(list post:gra)
      %+  turn  ~(tap by post-graph)
        |=  [ship-dec=atom node=node:gra]
        ?<  ?=(%| -.post.node)
        =/  p     ^-(post p.post.node)
        [p]
    ::  Get the last post
    =/  last              (rear posts)
    =/  contact           (form-contact-mtd rolo to-ship)
    =/  path              (spat /dm-inbox/(scot %p to-ship))
    [path (silt ~[to-ship]) %dm %graph-store time-sent.last contents.last (silt ~[contact])]
  ::
  ::  Pending dms
  ::
  ++  form-pending
    |=  [=ship now=@da rolo=rolodex:sur]
    ^-  message-preview
    =/  path              (spat /dm-inbox/(scot %p ship))
    [path (silt ~[ship]) %pending %graph-store now [~] (silt ~[(form-contact-mtd rolo ship)])]
  ::
  ::
  ::
  ++  dm-log
    |=  [our=ship to-ship=ship now=@da]
    ^-  chat 
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
    =/  contact             (form-contact-mtd rolo to-ship)
    =/  path                (spat /dm-inbox/(scot %p to-ship))
    [path (silt ~[to-ship]) %dm %graph-store (flop dms) (silt ~[contact])]
  ::
  ++  received-dm
    |=  [ship-dec=@ud idx=atom =node:gra our=ship now=@da]
    ^-  chat
    =/  to-ship             ^-(@p `@p`ship-dec)
    =/  message             (node-to-dm idx node)
    ::  for now we are going to include the contact data in a newly received dm
    ::  because it could possibly be a new dm and am not sure how to check for 
    ::  this yet
    =/  rolo                .^(rolodex:sur %gx /(scot %p our)/contact-store/(scot %da now)/all/noun)
    =/  contact             (form-contact-mtd rolo to-ship)
    =/  path                (spat /dm-inbox/(scot %p to-ship))
    [path (silt ~[to-ship]) %dm %graph-store [message ~] (silt ~[contact])]
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
    :: =/  id      %+  roll  index.p
    ::             |=  [cur=@ acc=@t]
    ::             ^-  @t
    ::             =/  num  `@u`cur
    ::             (rap 2 acc '/' num ~)
    :: ~&  >  id
    [index.p author.p time-sent.p contents.p]
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
      [path.cha (preview cha)]
  ::
  ++  preview
    |=  cha=message-preview
    ^-  json
    =/  to-field    
      ?:  =(%group type.cha)  
        a+(turn ~(tap in to.cha) |=(shp=@p s+(scot %p shp)))
      s+(scot %p (rear ~(tap in to.cha)))
    =/  mtd-field    
      ?:  =(%group type.cha)  
        a+(turn ~(tap in metadata.cha) mtd)
      (mtd (rear ~(tap in metadata.cha)))
    %-  pairs
    :~  
        ['path' s+path.cha]
        :: ['index' (index index.dm)]
        ['to' to-field]
        ['type' s+(scot %tas type.cha)]
        ['source' s+(scot %tas source.cha)]
        ['lastTimeSent' (time last-time-sent.cha)]
        ['lastMessage' a+(turn last-message.cha content)]
        ['metadata' mtd-field]
    ==
  ::
  ++  dm-log
    |=  cha=chat
    ^-  json
    =/  to-field    
      ?:  =(%group type.cha)  
        a+(turn ~(tap in to.cha) |=(shp=@p s+(scot %p shp)))
      s+(scot %p (rear ~(tap in to.cha)))
    =/  mtd-field    
      ?:  =(%group type.cha)  
        a+(turn ~(tap in metadata.cha) mtd)
      (mtd (rear ~(tap in metadata.cha)))
    %-  pairs
    :~ 
      ['path' s+path.cha]
      :: ['index' (index index.dm)]
      ['to' to-field]
      ['path' s+path.cha]
      ['type' s+(scot %tas type.cha)]
      ['source' s+(scot %tas source.cha)]
      ['messages' a+(turn messages.cha graph-dm)]
      ['metadata' mtd-field]
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
  ::
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
        ['index' (index index.dm)]
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