:+  'Periodic'
  :~  ['Start' %da]
      ['Period' %dr]
  ==
'''
|=  args=(map @t arg)
=/  start=@da   +:;;($>(%da arg) (~(got by args) 'Start'))
=/  period=@dr  +:;;($>(%dr arg) (~(got by args) 'Period'))
^-  $-(@ud (each fullday rule-exception))
|=(idx=@ud [%& (sane-fd (add (sane-fd start) (mul idx period)))])
'''
