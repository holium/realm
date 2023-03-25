/-  *tomedb
|%
++  dejs  =,  dejs:format
  |%
  ++  tomedb-kv-action
    |=  jon=json
    ^-  ^tomedb-kv-action
    =*  perl  (su (perk [%our %space %open %unset %yes %no ~]))
    =*  invl  (su (perk [%read %write %admin %block ~]))
    %.  jon
    %-  of
    :~  set-value/(ot ~[ship/so space/so app/so bucket/so key/so value/so])
        remove-value/(ot ~[ship/so space/so app/so bucket/so key/so])
        clear-kv/(ot ~[ship/so space/so app/so bucket/so])
        verify-kv/(ot ~[ship/so space/so app/so bucket/so])
        watch-kv/(ot ~[ship/so space/so app/so bucket/so])
        team-kv/(ot ~[ship/so space/so app/so bucket/so])
        perm-kv/(ot ~[ship/so space/so app/so bucket/so perm/(ot ~[read/perl write/perl admin/perl])])
        invite-kv/(ot ~[ship/so space/so app/so bucket/so guy/so level/invl])
    ==
  ::
  --
:: ++  enjs  =,  enjs:format
::   |%
::   ++  tomedb-kv-reaction
::     |=  upd=^tomedb-kv-reaction
::     ^-  json
::     ?-  -.upd
::       %set     (frond key.upd s+value.upd)
::       %remove  (frond key.upd ~)
::       %clear   (pairs ~)
::       %perm    (pairs ~[[%write s+write.upd] [%admin s+admin.upd]])
::       :: %get     value.upd
::       %all     o+data.upd
::     ==
::   ::
::   --
--