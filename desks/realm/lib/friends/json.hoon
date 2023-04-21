/-  *friends
|%
++  dejs  =,  dejs:format
  |%
  ++  friends-action-0
    |=  jon=json
    ^-  ^friends-action-0
    %.  jon
    %-  of
    :~  add-friend/(ot ~[ship/so])
        edit-friend/(ot ~[ship/so pinned/bo tags/(as so)])
        remove-friend/(ot ~[ship/so])
        block-friend/(ot ~[ship/so])
        unblock-friend/(ot ~[ship/so])
        set-contact-info/(ot ~[contact-info/(mu (at ~[username/so color/nu twitter/(mu so) bio/(mu so) avatar/(mu so) cover/(mu so) featured-url/(mu so)]))])
        set-status/(ot ~[status/so])
    ==
  ::
  --
::
:: ++  enjs  =,  enjs:format
::   |%
::   ++  friends-update-0
::     |=  upd=^friends-update-0
::     ^-  json
::     ?-  -.upd
::       %set     (frond key.upd s+value.upd)
::       %remove  (frond key.upd ~)
::       %get     value.upd
::       %all     o+data.upd
::     ==
::   ::
::   --
:: ::
--