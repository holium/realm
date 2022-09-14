/+  ethereum
=,  ethereum-types
|%
  +$  etyp  etyp:abi:ethereum
  +$  abi-events  (pair (map @ux @tas) (map @tas (pair (list etyp) type)))
  +$  contract
    $:  name=@tas
        write-functions=(map @tas function)
        read-functions=(map @tas function)
        events=(map @ux event)
    ==
  +$  function
    $:  name=@tas
        sel=@t
        inputs=(list func-input)
        outputs=(list func-output)
    ==
  +$  event
    $:  name=@tas
        inputs=(list event-input)
    ==
  +$  event-input  [name=@tas type=etyp indexed=?]
  +$  func-input  [name=@tas type=etyp]
  +$  func-output  [name=(unit @tas) type=etyp]
  +$  event-input-raw  [name=@t type=@t indexed=?]
  +$  func-input-raw  [name=@t type=@t]
  +$  func-output-raw  [name=(unit @t) type=@t]
  +$  contract-raw
    $:  name=@t
        entries=(list entry-raw)
    ==
  +$  entry-raw
    $%  [%function p=function-raw]
        [%event p=event-raw]
    ==
  +$  function-raw
    $:  name=@t
        inputs=(list func-input-raw)
        outputs=(list func-output-raw)
        mut=?
        pay=?
    ==
  +$  event-raw
    $:  name=@t
        inputs=(list event-input-raw)
    ==

  ++  damn-skim
  |=  [es=(list event-input) b=?]
  ^-  (list event-input)
  %+  skim  es
  |=  =event-input
  =(indexed.event-input b)


  ++  etyp-to-type
    |*  type=etyp
    ^-  ^type
    ?+  type  !!
    ::
        %address
      [%atom %ux ~]
        %uint
      [%atom %ud ~]
        %bool
      [%atom %f ~]    ::
        %int :: doesn't work with decode lib yet
      !!
    ::
        %string
      [%atom %t ~]    ::
        %bytes
      -:!>(octs)
    ::
        [%bytes-n *]
      -:!>(*octs)
    ::
        [%array *]
      [%atom %ux ~]
    ::
        [%array-n *]
      [%atom %ux ~]
    ==
  ++  event-data-to-tuple
    |*  [event-topics=* event-data=*]
    ?^  event-topics
      :-  -.event-topics
      $(event-topics +.event-topics)
    [event-topics event-data]
::  maybe (list ?(?(@ [@ @] (list @)) (list ?(@ [@ @] (list @))))))
:: (list ?(?(@ [@ @]) (list ?(@ [@ @] (list @)))))
  ++  encode-topics
    |=  [types=(list etyp) topics=(list ?(@ (list @)))]
    |-  ^-  (list ?(@ux (list @ux)))
    ?~  topics  ~
    ?~  types  ~
    ?+  i.types  ~&  'type not implemented'  !!
        ?(%address %bool %int %uint %real %ureal)
      :: ?~  i.topics  ~
      ?^  i.topics
        :: topic is (list @)
        :_  ?~  t.topics  ~
            ^-  (list ?(@ux (list @ux)))
            $(types t.types, topics t.topics)
        ^-  (list @ux)
        %+  turn  %-  (list @)  i.topics
        |=  t=@
        (scan (encode-data:abi:ethereum (data:abi:ethereum [i.types t])) hex)
      :: topic is @
      :-  ^-  @ux  %+  scan
            (encode-data:abi:ethereum (data:abi:ethereum [i.types i.topics]))
          hex
      ?~  t.topics  ~
      ^-  (list ?(@ux (list @ux)))
      $(types t.types, topics t.topics)
    ==
  ++  tuple-to-eth-data  ::  n-tuple
    |=  [etyps=(list etyp:abi:ethereum) tuple=*]
    =,  abi:ethereum
    |-  ^-  (list data)
    ?~  etyps  ~
    ?+  i.etyps  ~|("unimplemented etyp" !!)
        %uint
      ?~  t.etyps
        ?>  ?=(@ud tuple)
        [[i.etyps tuple] ~]
      ?>  ?=([@ud *] tuple)
      [[i.etyps -.tuple] $(etyps t.etyps, tuple +.tuple)]
        %address
      ?~  t.etyps
        ?>  ?=(@ux tuple)
        [[i.etyps tuple] ~]
      ?>  ?=([@ux *] tuple)
      [[i.etyps -.tuple] $(etyps t.etyps, tuple +.tuple)]
        %bool
      ?~  t.etyps
        ?>  ?=(? tuple)
        [[i.etyps tuple] ~]
      ?>  ?=([? *] tuple)
      [[i.etyps -.tuple] $(etyps t.etyps, tuple +.tuple)]
    ==
    :: ?.  ?=(?(%uint %address %bool) i.etyps)  ~|("unimplemented etyp" !!)
    :: ?~  t.etyps
    ::   ?>  ?=(@ tuple)
    ::   [`[i.etyps tuple] ~]
    :: ?>  ?=([@ *] tuple)
    :: [`data`[i.etyps -.tuple] $(etyps t.etyps, tuple +.tuple)]


::
  ++  event-inputs-to-face-pairs
    |=  =event
    ^-  tape
    %-  zing
    %+  join  " "
    %+  turn  inputs.event
    |=  [inp=event-input]
    "{(trip name.inp)}={(etyp-to-aura type.inp)}"
::
  ++  event-indexed-inputs-to-face-pairs
    |=  =event
    ^-  tape
    %-  zing
    %+  join  " "
    %+  turn  (skim inputs.event |=(inp=event-input indexed.inp))
    |=  [inp=event-input]
    "{(trip name.inp)}={(etyp-to-topic type.inp)}"
::
  ++  function-inputs-to-face-pairs
    |=  =function
    ^-  tape
    %-  zing
    %+  join  " "
    %+  turn  inputs.function
    |=  [=func-input]
    "{(trip name.func-input)}={(etyp-to-aura type.func-input)}"
::
  ++  function-outputs-to-face-pairs
    |=  =function
    ^-  tape
    ?~  outputs.function  "~"
    ?~  t.outputs.function
      =/  name=(unit @tas)  name.i.outputs.function
      ?~  name
        "{(etyp-to-aura type.i.outputs.function)}"
      "{(trip u.name)}={(etyp-to-aura type.i.outputs.function)}"
    =-  "[{-}]"
    %-  zing
    %+  join  " "
    %+  turn  outputs.function
    |=  [name=(unit @t) =etyp]
    ?~  name
      "{(etyp-to-aura etyp)}"
    "{(trip u.name)}={(etyp-to-aura etyp)}"
::
  ++  etyp-to-topic
    |*  type=etyp
    :: ^-  tape
    ?+  type  !!
    ::
        %address
      "?(@ux (list @ux))"
        %uint
      "?(@ux (list @ud))"
        %bool
      "?(? (list ?))"
        %int :: doesn't work with decode lib yet
      !!
        %string
      "?(@t (list @t))"
        %bytes
      "?(octs (list octs))"
        [%bytes-n *]
      "?(octs (list octs))"
    ::
        [%array *]
      "?(@ux (list @ux))"
    ::
        [%array-n *]
      "?(@ux (list @ux))"
    ==
::
  ++  etyp-to-aura
    |*  type=etyp
    :: ^-  tape
    ?+  type  !!
        %address
      "@ux"
        %uint
      "@ud"
        %bool
      "?"
        %int :: doesn't work with decode lib yet
      !!
        %string
      "@t"
        %bytes
      "octs"
        [%bytes-n *]
      "octs"
        [%array *]
      "@ux"
        [%array-n *]
      "@ux"
    ==
    ::
  ++  etyps-to-etape
    |=  etyps=(list etyp)
    %-  zing
    %+  join  " "
    %+  turn   etyps
    |=  [typ=etyp]
    ?^  typ
      ~|  "unimplemented etyp for subscription encoding"  !!
    "%{(trip typ)}"
    ::
  ++  name-to-lower
    |=  =tape
    ^-  ^tape
    ?~  tape  ~
    =/  tape=^tape
    :_  t.tape
      ?:  (lth i.tape 91)
        (add i.tape 32)
      i.tape
    %-  zing
    |-
    ?~  tape  ~
    ?~  t.tape
      [(trip i.tape) ~]
    ?:  (lth i.t.tape 91)
      =.  i.t.tape  (add i.t.tape 32)
      [(trip i.tape) "-" $(tape t.tape)]
    [(trip i.tape) $(tape t.tape)]
::
  ++  code-gen-diff-mark
    |=  [sur-name=tape]
    %-  crip
    """
    /-  ethers
    /+  *eth-contracts-{sur-name}
    |_  dif=diff
    ++  grow
      |%
      ++  json  (diff-to-json dif)
      --
    ++  grab
      |%
        ++  noun  diff
        ++  eth-watcher-diff  decode-diff
      --
    --
    """
  ++  code-gen-ezub-mark
    |=  [sur-name=tape]
    %-  crip
    """
    /-  ethers
    /+  *eth-contracts-{sur-name}
    |_  zub=ezub
    ++  grow
      |%
      ++  eth-watcher-poke  (encode-ezub zub)
      --
    ++  grab
      |%
        ++  noun  ezub
      --
    --
    """

    :: ++  code-gen-gift-mark
      :: |=  [sur-name=tape]
      :: %-  crip
      :: """
      :: /-  ethers
      :: /+  *eth-contracts-{sur-name}
      :: |_  re=rez
      :: ++  grow
      ::   |%
      ::   ++  json  (gift-to-json rez)
      ::   --
      :: ++  grab
      ::   |%
      ::     ++  noun  read-call
      ::     ++  eth-watcher-diff  read-call
      ::   --
      :: --
      :: """
  ++  code-gen-call-mark
    |=  [sur-name=tape]
    %-  crip
    """
    /-  ethers
    /+  *eth-contracts-{sur-name}
    |_  cal=call:methods
    ++  grow
      |%
        ++  eth-call-data  (encode-call cal)
      --
    ++  grab
      |%
        ++  noun  call:methods
      --
    --
    """
  ++  code-gen-send-mark
    |=  [sur-name=tape]
    %-  crip
    """
    /-  ethers
    /+  *eth-contracts-{sur-name}
    |_  sen=send:methods
    ++  grow
      |%
        ++  eth-call-data  (encode-send sen)
      --
    ++  grab
      |%
        ++  noun  send:methods
      --
    --
    """

  ++  code-gen-rez-mark
    |=  [sur-name=tape]
    %-  crip
    """
    /-  ethers
    /+  *ethers, *eth-contracts-{sur-name}
    |_  re=rez
    ++  grow
      |%
        ++  json
          =,  enjs:format
          %+  frond  %{sur-name}
          %+  frond  %rez
          (rez-to-json re)
      --
    ++  grab
      |%
        ++  noun  rez
      --
    --
    """
  ++  code-gen-rek-mark
    |=  [sur-name=tape]
    %-  crip
    """
    /-  ethers
    /+  *eth-contracts-{sur-name}
    |_  re=rek
    ++  grab
      |%
        ++  noun  rek
        ++  eth-call-result  decode-rek
      --
    --
    """

  ++  code-gen-types
    |=  [name=@tas =contract]  :: remove name since we're doing cages now
    =/  read-functions=(list function)
    (turn ~(tap by read-functions.contract) |=([* =function] function))
    =/  write-functions=(list function)
    (turn ~(tap by write-functions.contract) |=([* =function] function))
    =/  events=(list event)
    (turn ~(tap by events.contract) |=([* =event] event))
    |^
      %-  crip
      """
      /-  ethers
      =,  able:jael
      =,  builders=builders:ethers
      |%
      +$  diff  ::  gift
          $%  [$history =loglist]
              [$log =event-log]
              [$disavow =id:block]
          ==
      +$  ezub  ::  poke
          $%  [$watch =path config=watch-config]
              [$clear =path]
          ==
      +$  event-log  (event-log-config:builders event-update)
      +$  watch-config
          %-  watch-config:builders
          watch
      +$  loglist  (list event-log)
      ::+$  kall
      ::    (call:builders {(trip name)}  call:methods)
      ::+$  zend
      ::    (send-tx:builders {(trip name)} send:methods)
      +$  rek
          $%
      {function-read-results}
          ==
      +$  rez
        $:  name=?({function-write-results})
            =address:ethereum  txh=@ux
            status=?  block=@ud
        ==
      +$  event-update
          $%
      {event-bucs}
          ==
      +$  watch
          $%
      {event-indexed-bucs}
          ==
      ++  methods
        |%
        ++  send
          $%
      {(function-calls write-functions)}
          ==
        ++  call
          $%
      {(function-calls read-functions)}
          ==
        --
      --
      """
      ++  nl  (trip 10)
      ++  event-bucs
        ^-  tape
        %-  zing
        ?~  events  ~
        %+  join  nl
        %+  turn  events
        |=  =event
        :: =-  (zing ~["        [${(trip name.event)} {-}]" nl])
        =-  "        [${(trip name.event)} {-}]"
        (event-inputs-to-face-pairs event)
      ++  event-indexed-bucs
        ^-  tape
        %-  zing
        ?~  events  ~
        %+  join  nl
        %+  turn  events
        |=  =event
        =-  (zing ~["        [${(trip name.event)} " ?~(- "~]" "{-} ~]")])
        (event-indexed-inputs-to-face-pairs event)
      ++  function-calls
        |=  functions=(list function)
        ^-  tape
        %-  zing
        ?~  functions  ~
        %+  join  nl
        %+  turn  functions
        |=  =function
        =-  (zing ~["        [${(trip name.function)}" ?~(- " ~]" " {-}]")])
        (function-inputs-to-face-pairs function)
      ++  function-read-results
        :: |=  functions=(list function)
        ^-  tape
        %-  zing
        ?~  read-functions  ~
        %+  join  nl
        %+  turn  read-functions
        |=  =function
        :: =-  %-  zing  ~["        [${(trip name.function)} out={-}]" nl]
        =-  "        [${(trip name.function)} out={-}]"
        (function-outputs-to-face-pairs function)
      ++  function-write-results
        %-  zing
        %+  join  " "
        %+  turn  ~(tap by write-functions.contract)
        |=([name=@tas =function] (zing ~["%" (trip name)]))
        :: |=  functions=(list function)
    --
::
  ++  code-gen-lib
    |=  [=contract sur-name=@tas]
    ^-  cord
    =/  read-functions=(list function)
    (turn ~(tap by read-functions.contract) |=([* =function] function))
    =/  write-functions=(list function)
    (turn ~(tap by write-functions.contract) |=([* =function] function))
    =/  events=(list event)
    (turn ~(tap by events.contract) |=([* =event] event))
    |^
      %-  crip
      """
      /-  eth-watcher, *eth-contracts-{(trip sur-name)}
      /+  eth-abi
      |%
      ++  diff-to-json
      |=  =diff
      =,  enjs:format
      ^-  json
      %+  frond  %{(trip sur-name)}
      ?-  -.diff
          %history
        %+  frond  %history
        [%a (turn loglist.diff event-log-to-json)]
          %log
        %+  frond  %log
        (event-log-to-json event-log.diff)
          %disavow
        !!
      ==
      :: ++  rez-to-json
      ::   |=  =rez
      ::   =,  enjs:format
      :: ++  rek-to-json
      ::   |=  =rek
      ::   =,  enjs:format

      ++  event-log-to-json
        |=  [=event-log]
        ^-  json
        =,  enjs:format
      {log-json-cases}
      ++  encode-ezub
        |=  =ezub
        ^-  poke:eth-watcher
        ?-  -.ezub
            %watch
      {encode-ezub-cases}
            %clear
          ezub
        ==
      ++  decode-diff
        |=  =diff:eth-watcher
        ^-  ^diff
        ?-  -.diff
            %history
          :-  %history
          %+  turn  loglist.diff  decode-log
            %log
          :-  %log  (decode-log event-log.diff)
            %disavow
          diff
        ==
      ++  decode-rek
        |=  [name=@tas result=@t]
        ^-  rek
        ?+  name  ~|  "unexpected result in contract {(trip sur-name)}"  !!
      {encode-result-cases}
        ==
      ++  encode-send
        |=  =send:methods
        ^-  call-data:rpc:ethereum
        ?-  -.send
      {(encode-method-cases write-functions.contract %send)}
        ==
      ++  encode-call
        |=  =call:methods
        ^-  call-data:rpc:ethereum
        ?-  -.call
      {(encode-method-cases read-functions.contract %call)}
        ==
      ++  decode-log
        |=  [=event-log:rpc:ethereum]
        ^-  ^event-log
      {decode-log-cases}
      ~|  "unexpected event in {(trip name.contract)}"  !!
      --
      """
    ++  nl  (trip 10)
    ++  rez-out-names
      %-  zing
      %+  join  " "
      %+  turn  ~(tap by write-functions.contract)
      |=([name=@tas =function] (zing ~["%" (trip name)]))
    ++  encode-result-cases
      :: |=  [functions=(map @tas function) face=@tas]
      %-  zing
      %+  join  nl
      %+  turn  ~(tap by read-functions.contract)
      |=  [name=@tas =function]
      =/  outputs=(list etyp)
        (turn outputs.function |=(fo=func-output type.fo))
      =/  data-types=tape ::  TODO: highly duplicated pattern 0, abstract
        %-  zing
        %+  join  " "
        %+  turn  outputs
        |=  [=etyp]
        ?^  etyp
          ~|  "unimplemented etyp for result decoding"  !!
        "%{(trip etyp)}"
      =-
      """
              %{(trip name)}
            {-}
      """
      ?~  outputs  "[%{(trip name)} ~]"
      "[%{(trip name)} (decode-results:rpc:ethereum result ~[{data-types}])]"
    ++  encode-method-cases
      |=  [functions=(map @tas function) face=@tas]
      %-  zing
      %+  join  nl
      %+  turn  ~(tap by functions)
      |=  [name=@tas =function]
      =/  inputs=(list etyp)
        (turn inputs.function |=(fi=func-input type.fi))
      =-
      """
              %{(trip name)}
            :-  '{(trip sel.function)}'
            {-}
      """
      ?~  inputs  "~"
      "(tuple-to-eth-data:eth-abi ~[{(etyps-to-etape inputs)}] +.{(trip face)})"
    ++  decode-log-cases
      %-  zing
      %+  join  nl
      %+  turn  ~(tap by events.contract)
      |=  [hash=@ux =event]
      ^-  tape
      ?~  inputs.event
      """
        ?:  =(i.topics.event-log {(scow %ux hash)})
          [%{(trip name.event)} ~]
      """
        :: (skim inputs.event |=(i=event-input !indexed.i)
      =/  topic-types=tape  ::  TODO: highly duplicated pattern 0, abstract
        %-  zing
        %+  join  " "
        %+  turn  (damn-skim inputs.event &)
        |=  [inp=event-input]
        ?^  type.inp
          ~|  "unimplemented etyp for subscription encoding"  !!
        "%{(trip type.inp)}"
      =/  data-types=tape ::  TODO: highly duplicated pattern 0, abstract
        %-  zing
        %+  join  " "
        %+  turn  (damn-skim inputs.event |)
        |=  [inp=event-input]
        ?^  type.inp
          ~|  "unimplemented etyp for subscription encoding"  !!
        "%{(trip type.inp)}"
      """
        ?:  =(i.topics.event-log {(scow %ux hash)})
          :*  mined.event-log
              address.event-log
              %+  event-data-to-tuple:eth-abi
                [%{(trip name.event)} (decode-topics:rpc:ethereum t.topics.event-log ~[{topic-types}])]
              (decode-results:rpc:ethereum data.event-log ~[{data-types}])
          ==
      """
      ::
    ++  encode-ezub-cases
      =-
      """
            =/  =topics:eth-watcher
              ?-  -.topics.config.ezub
      {-}
              ==
            =/  =config:eth-watcher
              :*  url=url.config.ezub
                  eager=eager.config.ezub
                  refresh-rate=refresh-rate.config.ezub
                  timeout-time=timeout-time.config.ezub
                  from=from.config.ezub
                  contracts=contracts.config.ezub
                  topics
              ==
            :*  %watch
                path.ezub
                config
            ==
      """
      %-  zing
      %+  join  (trip `@t`10)
      %+  turn  ~(tap by events.contract)
      |=  [hash=@ux =event]
      ^-  tape
      =-
      ?~  inputs.event
      """
                  %{(trip name.event)}
                [{(scow %ux hash)} ~]
      """
      """
                  %{(trip name.event)}
                :-  {(scow %ux hash)}
                (encode-topics:eth-abi ~[{-}] +.topics.config.ezub)
      """
      %-  zing
      %+  join  " "
      %+  turn   (skim inputs.event |=(inp=event-input indexed.inp))
      |=  [inp=event-input]
      :: ?.  indexed.i  ""
      ?^  type.inp
        ~|  "unimplemented etyp for subscription encoding"  !!
      "%{(trip type.inp)}"

    ++  log-json-cases
      =-
      """
            ?-  -.event-data.event-log
      {-}
            ==
      """
      %-  zing
      %+  join  (trip `@t`10)
      %+  turn  events
      |=  =event
      ^-  tape
      =-
      """
                %{(trip name.event)}
              %-  pairs
              :*
                [%type [%s %{(trip name.event)}]]
                [%address [%s (crip (z-co:co address.event-log))]]
                :-  %payload
                %-  pairs
                :~
      {-}
                ==
                ?~  mined.event-log  ~
                :~
                :-  'txHash'
                [%s (crip (z-co:co transaction-hash.u.mined.event-log))]
                :-  'block'
                [%s (crip ((d-co:co 1) block-number.u.mined.event-log))]
                ==
              ==
      """
      (inputs-json event)
    ++  inputs-json
      |=  =event
      %-  zing
      %+  turn  inputs.event
      |=  inp=event-input
      =-
      (zing ~["          [%{(trip name.inp)} {-}]" nl])
      (etyp-to-json type.inp name.inp)
    ++  etyp-to-json
      |=  [=etyp name=@tas]
      ^-  tape
      ?+  etyp  ~|("unimplemented etyp-to-json type" !!)
          %uint
        "[%n (crip ((d-co:co 1) {(trip name)}.event-data.event-log))]"
          %int
        !!
      :: "[%n (scot %sd {(trip name)}.event-data.event-log)]"
          %address
        "[%s (crip (z-co:co {(trip name)}.event-data.event-log))]"
          %bool
        "[%b {(trip name)}.event-data.event-log]"
      ==
  --
::
  ++  parse-contract
    |=  jon=json
    =/  =contract-raw
      =,  dejs:format
      %.  jon  %-  ot
      :~  ['contractName' so]
          [%abi parse-abi]
      ==
    ^-  contract
    :^    name.contract-raw
        (get-write-functions entries.contract-raw)
      (get-read-functions entries.contract-raw)
    (get-events entries.contract-raw)
::
  ++  parse-abi
    |=  jon=json
    =,  dejs:format
    ^-  (list entry-raw)
    %.  jon  %-  ar
    |=  jan=json
    ?>  ?=([%o *] jan)
    =/  typ  (so (~(got by p.jan) 'type'))
    %.  jan
    ?+    typ  ~&  "unexpected entry type"  !!
        %function
      |=  jun=json
      :-  %function
      ^-  function-raw
      %.  jun
      %-  ot
      |^
        :~  [%name so]
            [%inputs extract-func-input]
            [%outputs (ar extract-func-output)]
            [%constant |=(jen=json !(bo jen))]
            [%payable bo]
        ==
        ++  extract-func-input
          %-  ar
          %-  ot
          :~  [%name so]
              [%type so]
          ==
        ++  extract-func-output
        |=  jyn=json
        ?>  ?=([%o *] jyn)
        ^-  func-output-raw
        =/  name=(unit @t)  (bind (~(get by p.jyn) 'name') so)
        :-  ?~(name ~ ?~(u.name ~ name))
        (so (~(got by p.jyn) 'type'))
        :: %-  ar
        :: %-  ot
        :: :~  [%name (un so)]
        ::     [%type so]
        :: ==

      --
    ::
        %event
      |=  jun=json
      :-  %event
      ^-  event-raw
      %.  jun
      %-  ot
      :~  [%name so]
      ::
          :-  %inputs
          %-  ar
          %-  ot
          :~  [%name so]
              [%type so]
              [%indexed bo]
          ==
      ==
    ==
::
  ++  get-raw-functions
    |=  abi=(list entry-raw)
    ^-  (list function-raw)
    %+  roll  abi
    |=  [e=entry-raw fs=(list function-raw)]
    ?.  ?=([%function *] e)  fs
    [p.e fs]
::
  ++  get-raw-events
    |=  abi=(list entry-raw)
    ^-  (list event-raw)
    %+  roll  abi
    |=  [e=entry-raw fs=(list event-raw)]
      ?.  ?=([%event *] e)  fs
      [p.e fs]
::
  ++  get-events
    |=  abi=(list entry-raw)
    ^-  (map @ux event)
    %+  roll  (get-raw-events abi)
    |=  [e=event-raw es=(map @ux event)]
    =/  =event
      :-  (crip (name-to-lower (trip name.e)))
      %+  turn
        inputs.e
      |=  inp=event-input-raw
      ^-  event-input
      [(crip (name-to-lower (trip name.inp))) (parse-type type.inp) indexed.inp]
    =/  typs=(list @t)
      %+  turn  inputs.e
      |=  inp=event-input-raw
      type.inp
    %+  ~(put by es)
      (get-hash name.e typs)
      event
::
  ++  get-write-functions
    |=  abi=(list entry-raw)
    ^-  (map @tas function)
    %+  roll  (get-raw-functions abi)
    |=  [f=function-raw fs=(map @tas function)]
    ?.  mut.f  fs
    %+  ~(put by fs)  (crip (name-to-lower (trip name.f)))
    :*
      (crip (name-to-lower (trip name.f)))
      (get-selector name.f (turn inputs.f |=(=func-input-raw type.func-input-raw)))
      (parse-input-types inputs.f)
      (parse-output-types outputs.f)
    ==
::
  ++  get-read-functions
    |=  abi=(list entry-raw)
    ^-  (map @tas function)
    %+  roll  (get-raw-functions abi)
    |=  [f=function-raw fs=(map @tas function)]
    ?:  mut.f  fs
    %+  ~(put by fs)  (crip (name-to-lower (trip name.f)))
    :*
      (crip (name-to-lower (trip name.f)))
      (get-selector name.f (turn inputs.f |=(=func-input-raw type.func-input-raw)))
      (parse-input-types inputs.f)
      (parse-output-types outputs.f)
    ==
::
  ++  parse-type
    |=  typ=@t
    ^-  etyp
    ?+  (crip (scag 3 (trip typ)))
    ~&  'unimplmented/unexpected solidity type'  !!
      %add  %address
      %boo  %bool
      %int  %int
      %uin  %uint
      %byt  %bytes
      %str  %string
    ==
  ++  parse-input-types
    |=  typs=(list func-input-raw)
    ^-  (list func-input)
    %+  turn  typs
    |=([name=@t type=@t] [(crip (name-to-lower (trip name))) (parse-type type)])
  ++  parse-output-types
    |=  typs=(list func-output-raw)
    ^-  (list func-output)
    %+  turn  typs
    |=  [name=(unit @t) type=@t]
    :_  (parse-type type)
    %+  bind  name
    :(corl crip name-to-lower trip)
::
  ++  get-selector
    |=  [name=@t inputs=(list @t)]
    ^-  cord
    =-  (crip "{(trip name)}({-})")
    (zing (join "," (turn inputs trip)))
    :: %-  zing
    :: %+  join
    ::   ","
    :: %+  turn
    ::   inputs
    :: |=  type=etyp
    :: ?>  ?=()
    :: trip
::
  ++  get-hash
    |=  [name=@t inputs=(list @t)]
    ^-  @ux
    =/  sig  (get-selector name inputs)
    (keccak-256:keccak:crypto (met 3 sig) sig)
--
