/-  hood, docket, store=app-store
|_  =bowl:gall
++  on-init   `..on-init
++  on-save   !>(~)
++  on-load   |=(vase `..on-init)
++  on-poke   |=(cage !!)
++  on-watch  |=(path !!)
++  on-leave  |=(path `..on-init)
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  |^
  ?+    path  ``json+!>(~)
    :: ~/scry/app-store/apps
    [%x %apps ~]
      ``json+!>((apps-js (report-prep our.bowl now.bowl)))

    :: ~/scry/app-store/apps/<desk>
    [%x %apps @ ~]
      =/  =desk  i.t.t.path
      ``json+!>((vat-js (report-prep our.bowl now.bowl) our.bowl now.bowl desk))
  ==
  ::
  ++  report-prep
    |=  [our=@p now=@da]
    =/  ego  (scot %p our)
    =/  wen  (scot %da now)
    :*  .^(rock:tire:clay %cx /[ego]//[wen]/tire)
        .^(=cone:clay %cx /[ego]//[wen]/domes)
        .^((map desk [ship desk]) %gx /[ego]/hood/[wen]/kiln/sources/noun)
        .^  (map [desk ship desk] sync-state:hood)  %gx
            /[ego]/hood/[wen]/kiln/syncs/noun
        ==
        :: dockets
        .^(charge-update:docket %gx /[ego]/docket/[wen]/charges/noun)
    ==
  ::
  ++  apps-js
    =,  enjs:format
    |=  [prep=apps-view-prep:store]
    ^-  json
    %-  pairs
    %+  turn
      %+  sort
        =/  sed  .^((set desk) %cd /(scot %p our.bowl)/base/(scot %da now.bowl))
        (sort ~(tap in sed) |=([a=@ b=@] !(aor a b)))
      |=([a=desk b=desk] ?|(=(a %kids) =(b %base)))
    |=(syd=desk [syd (vat-js prep our.bowl now.bowl syd)])
  ::
  ++  vat-js
    =,  enjs:format
    |=  [prep=apps-view-prep:store our=@p now=@da syd=desk]
    ::
    ^-  json
    =/  ego  (scot %p our)
    =/  wen  (scot %da now)
    =+  .^(=cass:clay %cw /[ego]/[syd]/[wen])
    ?:  =(ud.cass 0)
      %-  pairs
      :~  [%status [%s 'desk does not yet exist']]
      ==
    ?:  =(%kids syd)
      =+  .^(hash=@uv %cz /[ego]/[syd]/[wen])
      %-  pairs
      :~  ['desk-hash' [%s (crip "{<hash>}")]]
      ==
    =/  kel-path
      /[ego]/[syd]/[wen]/sys/kelvin
    ?.  .^(? %cu kel-path)
      %-  pairs
      :~  [%status [%s 'bad desk']]
      ==
    =+  .^(=waft:clay %cx kel-path)
    =/  hash  .^(@uv %cz /[ego]/[syd]/[wen])
    =/  =sink:hood
      ?~  s=(~(get by sor.prep) syd)
        ~
      ?~  z=(~(get by zyn.prep) syd u.s)
        ~
      `[-.u.s +.u.s +.u.z]
    =/  meb=(list @uv)
      ?~  sink  [hash]~
      (mergebase-hashes:hood our syd now her.u.sink sud.u.sink)
    =/  dek  (~(got by tyr.prep) syd)
    =/  sat
      ?-  zest.dek
        %live  "running"
        %dead  "suspended"
        %held  "suspended until next update"
      ==
    =/  kul=(list json)
      %+  turn
        %+  sort
          ~(tap in (waft-to-wefts:clay waft))
        |=  [a=weft b=weft]
        ?:  =(lal.a lal.b)
          (lte num.a num.b)
        (lte lal.a lal.b)
      |=  [=weft]
        (numb num.weft)
    ::
    =/  [on=(list [@tas ?]) of=(list [@tas ?])]
      =/  =dome:clay  (~(got by cone.prep) our syd)
      (skid ~(tap by ren.dome) |=([* ?] +<+))
    ::
    =/  pub  (get-publisher:hood our syd now)
    =/  upd  `(list [@tas @ud])`~(tap in wic.dek)
    ::
    %-  pairs
    =/  props=(list [cord json])
    :~  ['sys_kelvin' a+kul]
        ['base_hash' ?~(meb ~ s+(crip "{?.(=(1 (lent meb)) <meb> <(head meb)>)}"))]
        ['desk_hash' s+(crip "{<hash>}")]
        ['status' s+(crip sat)]
        ['publishing_ship' ?~(sink ~ ?~(pub ~ s+(crip "{<u.pub>}")))]
        ['updates' s+?~(sink 'local' 'remote')]
        ['source_ship' ?~(sink ~ s+(crip "{<her.u.sink>}"))]
        ['source_desk' ?~(sink ~ s+sud.u.sink)]
        ['source_aeon' ?~(sink ~ s+(crip "{<let.u.sink>}"))]
        ['kids_desk' ?~(sink ~ ?~(kid.u.sink ~ s+(crip "{<u.kid.u.sink>}")))]
        ['pending_updates' ?~(upd ~ s+(crip "{<upd>}"))]
    ==
    ?>  ?=([%initial *] dockets.prep)
    =/  chg  (~(get by initial.dockets.prep) syd)
    ::  only append docket elements if the docket exists (should always exist)
    ?~  chg  props
    %+  weld  props
    ^-  (list [cord json])
    :~
        type+s+%urbit
        title+s+title.docket.u.chg
        info+s+info.docket.u.chg
        color+s+(scot %ux color.docket.u.chg)
        href+(href-js href.docket.u.chg)
        image+?~(image.docket.u.chg ~ s+u.image.docket.u.chg)
        version+(version-js version.docket.u.chg)
        license+s+license.docket.u.chg
        website+s+website.docket.u.chg
    ==
    ::
    ++  dock-js
      =,  enjs:format
      |=  [=docket:docket]
      ^-  json
      %-  pairs
      :~  type+s+%urbit
          title+s+title.docket
          info+s+info.docket
          color+s+(scot %ux color.docket)
          href+(href-js href.docket)
          image+?~(image.docket ~ s+u.image.docket)
          version+(version-js version.docket)
          license+s+license.docket
          website+s+website.docket
      ==
    ::
    ++  href-js
      =,  enjs:format
      |=  h=href:docket
      %+  frond  -.h
      ?-    -.h
          %site  s+(spat path.h)
          %glob
        %-  pairs
        :~  base+s+base.h
            glob-reference+(glob-reference-js glob-reference.h)
        ==
      ==
    ::
    ++  glob-reference-js
      =,  enjs:format
      |=  ref=glob-reference:docket
      %-  pairs
      :~  hash+s+(scot %uv hash.ref)
          location+(glob-location-js location.ref)
      ==
    ::
    ++  glob-location-js
      =,  enjs:format
      |=  loc=glob-location:docket
      ^-  json
      %+  frond  -.loc
      ?-  -.loc
        %http  s+url.loc
        %ames  s+(scot %p ship.loc)
      ==
    ::
    ++  version-js
      =,  enjs:format
      |=  v=version:docket
      ^-  json
      :-  %s
      %-  crip
      "{(num-js major.v)}.{(num-js minor.v)}.{(num-js patch.v)}"
    ::
    ++  num-js
      =,  enjs:format
      |=  a=@u
      ^-  ^tape
      =/  p=json  (numb a)
      ?>  ?=(%n -.p)
      (trip p.p)
  --
++  on-agent  |=([wire sign:agent:gall] !!)
++  on-arvo   |=([wire sign-arvo] !!)
++  on-fail   |=([term tang] `..on-init)
--
