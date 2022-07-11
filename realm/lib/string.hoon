|%

++  slugify
  |=  ex=tape
  =/  index  0  
  =/  result  *(list tape)  
  |-  ^-  (list tape)  
  ?:  =(index (lent ex))  
    result  
  ?:  =((snag index ex) ' ')  
    $(index 0, ex `tape`(slag +(index) ex), result (weld result ~[`tape`(scag index ex)]))    
  $(index +(index))

--