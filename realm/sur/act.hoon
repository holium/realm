|%

+$  state-0  [%0 store=json]

+$  server-settings
  $:  ::  'enable' | 'disable'
      ::  when set to 'disable', the authenticated flag on the
      ::  eyre inbound-request is ignored
      authentication-mode=@t
  ==

+$  action-agent-state
  $:  settings=server-settings
  ==

+$  action-result
    $:  success=?
        :: contains error data when success is %.n; otherwise contains response data data
        data=json
        store=json
        effects=(list card:agent:gall)
    ==

+$  action-data
  $:  action=@t
      resource=@t
      context=json
      data=json
  ==

+$  effect-data
  $:  resource=@t
      effect=@t
      data=json
  ==

+$  reaction-data
  $:  ::  ack/nack .. ack indicates success .. nack .. failure
      ack=@t
      ::  source action that triggered the reaction
      =action-data
      ::  list of effects resulting from the action
      effects=(list effect-data)
  ==

+$  call-context
    $:  =bowl:gall
        args=(map @t json)
        store=json
        action=action-data
    ==

--