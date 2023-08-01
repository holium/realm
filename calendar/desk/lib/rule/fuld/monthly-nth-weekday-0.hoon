:+  'Monthly nth Weekday'
  :~  ['Start' %da]
      ['Ordinal' %od]
      ['Weekday' %ud]
  ==
'''
|=  args=(map @t arg)
=/  start=@da  +:;;($>(%da arg) (~(got by args) 'Start'))
=/  =ord       +:;;($>(%od arg) (~(got by args) 'Ordinal'))
=/  w=@        +:;;($>(%ud arg) (~(got by args) 'Weekday'))
^-  $-(@ud (each fullday rule-exception))
|=  idx=@ud
=/  day=(unit @da)  ((monthly-nth-weekday start ord w) idx)
?~  day
  [%| %rule-error 'This day does not exist in this month.']
[%& (sane-fd u.day)]
'''
