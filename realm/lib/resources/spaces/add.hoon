/-  *act
|%
++  run
  |=  =call-context
  ^-  [(list card:agent:gall) (map @t json)]

  :: =/  data  ?:(?=[%o *] data) p.data ~)

  =/  result  (to-add-member:conv data)
  ::  if an error occurred during conversion, simply return
  ::   the result to the underlying framework which will deliver
  ::   the error as needed
  ?.  success.result  result

  ::  do stuff to add the member

  result
--