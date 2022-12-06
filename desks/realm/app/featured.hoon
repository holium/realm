/-  *featured
/+  dbug, verb, default-agent, agentio
|%
+$  card  card:agent:gall
+$  versioned-state
  $%  state-0
  ==
+$  state-0  [%0 =provider =spaces]
--
=|  state-0
=*  state  -
%-  agent:dbug
%+  verb  |
=<
^-  agent:gall
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %|) bowl)
    io    ~(. agentio bowl)
    hc    ~(. +> bowl)
::
++  on-init
  ^-  (quip card _this)
  `this
::
++  on-save  !>(state)
::
++  on-load
  |=  ole=vase
  ^-  (quip card _this)
  =/  old=state-0  !<(state-0 ole)
  `this(state old)
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?+  mark  (on-poke:def mark vase)
      %featured-action
    =/  act  !<(action vase)
    ?-    -.act
        %set-provider  
      =*  watch-other  ~(watch-other pass:hc /updates)
      =*  leave-other  ~(leave-other pass:hc /updates)
      ?:  =(provider provider.act)  `this
      :_  %=  this
            spaces    ~
            provider  provider.act
          ==
      %+  welp
        [(leave-other provider)]~
      ?:  =(our.bowl provider.act)  ~
      [(watch-other provider.act /updates)]~
        %add-space
      ?>  =(our.bowl src.bowl)
      ?>  =(our.bowl provider)
      :_  this(spaces (~(put by spaces) path.act +.act))
      :~  (fact:io featured-reaction+!>(act) ~[/ui])
          (fact:io featured-reaction+!>(act) ~[/updates])
      ==
        %remove-space 
      ?>  =(our.bowl src.bowl)
      ?>  =(our.bowl provider)
      :_  this(spaces (~(del by spaces) path.act))
      :~  (fact:io featured-reaction+!>(act) ~[/ui])
          (fact:io featured-reaction+!>(act) ~[/updates])
      ==
    ==
  ==
::
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ?+    path  (on-watch:def path)
      [%updates ~]
    :_  this
    ~[(fact:io featured-reaction+!>(initial+spaces) ~)]
      [%ui ~]
    :_  this
    ~[(fact:io featured-reaction+!>(initial+spaces) ~)]
  ==
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?+    wire  (on-agent:def wire sign)
      [%updates ~]
    ?<  =(our.bowl src.bowl)
    ?+    -.sign  (on-agent:def wire sign)
        %watch-ack
          ?~  p.sign  
          %.  `this
          (slog leaf+"{<dap.bowl>}: subscribed to /updates" ~)
          ~&  >>>  "{<dap.bowl>}: subscription to /updates failed"
          `this
        %kick
          ~&  >  "{<dap.bowl>}: kicked, resubscribing..."
          :_  this
          :~  %+  ~(watch-other pass:hc /updates)
                provider
              /updates
          ==
        %fact
          ?>  =(p.cage.sign %featured-reaction)
          =/  rxn=reaction  !<(reaction q.cage.sign)
          ?-    -.rxn
              %initial
            `this(spaces spaces.rxn)
              %add-space
            `this(spaces (~(put by spaces) path.rxn +.rxn))
              %remove-space
            `this(spaces (~(del by spaces) path.rxn))
          ==
    ==
  ==
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  ?+    path  (on-peek:def path)
      [%x %spaces ~]
    ~&  initial+spaces
    ``featured-reaction+!>(initial+spaces)
  ==
++  on-arvo   on-arvo:def
++  on-leave  on-leave:def
++  on-fail   on-fail:def
--
|_  =bowl:gall
+*  io    ~(. agentio bowl)
++  pass
  |_  =wire
  ++  poke-other
    |=  [other=@p =cage]
    ^-  card
    (~(poke pass:io wire) [other dap.bowl] cage)
  ::
  ++  watch-other
    |=  [other=@p =path]
    ^-  card
    (~(watch pass:io wire) [other dap.bowl] path)
  ::
  ++  leave-other
    |=  other=@p
    ^-  card
    (~(leave pass:io wire) other dap.bowl)
  --
--
