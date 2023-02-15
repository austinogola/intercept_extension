chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{
    if(request.duplicate){
      console.log(request.duplicate);
      duplicateRequest(request.duplicate)
    }
  
  })

const duplicateRequest=(args)=>{
    let url=args[0]
    let headers=args[1]
    let method=args[2]
    let destination=args[3]
    let label=args[4]
    let body=args[6]

    let heads={}

    headers.forEach(header => {
        heads[header.name]=header.value
    });

    console.log(body);
    
    fetch(url,{
        method:method,
        headers:heads,
        body:JSON.stringify(body)
    })
    .then(res=>{
        if(res.status==200){
            console.log('Succecccfull');
        }
        else{
            console.log('Unsuccessfull');
        }
    })
}