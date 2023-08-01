:+  'Yearly on Date'
  :~  ['Start' %da]
  ==
'''
|=  args=(map @t arg)
=/  start=@da  +:;;($>(%da arg) (~(got by args) 'Start'))
^-  $-(@ud (each fullday rule-exception))
|=  idx=@ud
=/  day=(unit @da)  ((yearly-on-date start) idx)
?~  day
  [%| %rule-error (crip "This date does not exist.")]
[%& (sane-fd u.day)]
'''
