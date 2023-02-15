// importScripts('handlePost.js')

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse)=>{
    if(request.setId){
        console.log('set id request received');
        userId=request.setId
        chrome.storage.local.set({userId:request.setId}).then(()=>{
            console.log(`Set userId to`,userId);
            registerRules()
            
        })
    }

    if(request.setTask){
        console.log('set task request received');
        taskAdd=request.setTask
        chrome.storage.local.set({taskAdd:request.setTask}).then(()=>{
            console.log(`Set task  to `,taskAdd);
            registerRules()
        })
    }

    if(request.state){
        state=request.state
        console.log(`Received signal `);
        chrome.storage.local.set({state:request.state}).then(()=>{
            registerRules()
        })
    }
})

let heaa={}

const duplicateRequest=(url,headers,method,destination,label,reqId)=>{
    if(req_ids.includes(reqId)){
        console.log('Duplicate: already handled');
    }
    else{
        req_ids.push(reqId)
        console.log('Found valid (GET)',url)
        let heads={}
        headers.forEach(val=>{
            heads[val.name]=val.value
        })

         fetch(url,{
        method:method,
        headers:heads
        })
        .then(async res=>{
            if(res.status==200){
                let resBody=await res.json()
            sendResBody(resBody,url,destination,label,'GET')

            }else{
                console.log(`Error duplicating (GET) ${url} `);
            }

        })


    }
    

    // chrome.cookies.get({})
    // cookies.forEach(val=>{
    //     cookieSt+=`${val.name}=${val.value}; `
    // })

    // heads['csrf-token']='ajax:3789551747108583699'
    // heads['cookie']=cookieSt


   
}

var userId
var taskAdd
var state

const sendResBody=(result,url,destination,label,method)=>{

    let data={}
    for (const [key, value] of Object.entries(result)) {
        data[key]=value
      }
    console.log(`Successfully duplicated (${method}) ${url} sending...`)
    fetch(destination+'?'+new URLSearchParams({
        user:userId,
        task:taskAdd,
        label:label
    }),{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
        // body:JSON.stringify({name:'Austo'})
    })
    .then(res=>{
        if(res.status==200){
            console.log(`Successfully sent (${method}) response body to ${destination}`);
        }
        else{
            console.log('Error sending response body to', destination);
        }
    })

}

// let userId

// const getUserId=()=>{
//     chrome.cookies.get({name:'rulesUUid'},val=>{
//         if(val){
//             userId=val
//         }
//         else{
//             //prompt
//         }
//     })
// }




let attached=false

const registerRules=()=>{
    
    // userId=userId.replace("'","")
    if(state=='ON'){
        if(userId){
            console.log('Fetching rules for',userId,' ...')
            let rulesUri=`https://matureshock.backendless.app/api/data/rule?where=userID='${userId}'`
    
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
    
                // const rules=result['rules']
                // const destination=result['destination']
    
                // rules.forEach(rule)
    
                console.log('rules...',result);
                let target_page=[]
                let target_urls=[]
                let methods=[]
                let dests=[]
                result.forEach(rule=>{

                    target_page.push(rule.target_page_url)
                    // target_request_url=rule.target_request_url.replace('*','')
                    target_urls.push(rule.target_request_url)
                    methods.push(rule.target_request_method[0])
                    dests.push(rule.destination_webhook_url)
                })
        
                if(target_page.length!==0 && target_urls.length!=0 && methods.length!=0 && dests.length!=0){
                    console.log('Formating rules...');
                    const formatted=formaT(result)
                    console.log('valid enabled rules',formatted)
                    // if(formatted.length)
                    addRuleListeners(formatted)
                }
                else{
                    console.log('Error fetching all the rules');
                    // console.log(result);
                }
                // addIntpt(target_page,target_urls,methods,dests)
                
        
            })
        }else{
            console.log('No user id');
        }
    }else{
        console.log('Interceptor OFF')
    }
    
    
    // rob-110  
    
}

registerRules()

const isValidUrl=(string) =>{
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return true
}  

const checkUrls=(rule)=>{

    let page_first
    let page_rest

    let url_first
    let url_rest

    

    if(rule.target_page_url){
        if(rule.target_page_url.includes('*')){
            page_first=rule.target_page_url.split('*')[0]
            page_rest=rule.target_page_url.split('*').slice(1)
        }else{
            page_first=rule.target_page_url
        }    
        
        if(isValidUrl(page_first)){
            if(rule.target_request_url){
                if(rule.target_request_url.includes('*')){
                    url_first=rule.target_request_url.split('*')[0]
                    url_rest=rule.target_request_url.split('*').slice(1)
                }else{
                    url_first=rule.target_request_url
                }

                if(isValidUrl(url_first)){
                    let fmt_obj={}
                    fmt_obj['destination']=rule.destination_webhook_url
                    fmt_obj['label']=rule.rule_label
                    fmt_obj['methods']=rule.target_request_method
           
                    fmt_obj['page_first']=page_first
                    fmt_obj['page_rest']=page_rest?page_rest:[]

                    fmt_obj['url_first']=url_first
                    fmt_obj['url_rest']=url_rest?url_rest:[]

                    return fmt_obj
                }
                else{
                    console.log(url_first, 'is not a valid url.Excluding rule ') 
                    return false
                }
            }
            else{
                console.log('no target_request_url in rule.Excluding rule')
                return false 
            }
            
        }
        else{
            console.log(page_first, 'is not a valid url.Excluding rule ')
            return false 
        }
    }
    else{
        console.log('no target_page_url in rule,excluding rule')
        return false
    }
}

const formaT=(raw_rules)=>{

    const format_rules=[]

    let enabled_rules=[]

    raw_rules.forEach(rule=>{
        // If rule.status
        if(rule.rule_status){
            enabled_rules.push(rule)
        }
        
    })

    if(enabled_rules.length>0){
        enabled_rules.forEach(rule=>{
            let rule_status=checkUrls(rule)
            if(rule_status){
                format_rules.push(rule_status)
            }
        })
    }
    else{
        console.log('No enabled rules',enabled_rules)
    }

    

    // if(enabled_rules.length>0){
    //     console.log('Enabled rules',enabled_rules)
    //     let rootUrls=[]

    //     enabled_rules.forEach(rule=>{
    //         let fmt_obj={}
            
    //         fmt_obj['destination']=rule.destination_webhook_url
    //         fmt_obj['label']=rule.rule_label
    //         fmt_obj['methods']=rule.target_request_method
    
            
    //         let page_arr=rule.target_page_url.replaceAll('*','').split('/').filter(i=>i.length>0)
    
    //         let head=page_arr[0]
    //         rootUrls.push(`*://*.${head}/*`)
    //         rootUrls.push(`*://*/${head}/*`)
    
    //         let rest=page_arr.length>1?page_arr.slice(1):null
    //         // console.log(new URL(head))
    //         // referer_paths.push(rest)
    //         // rest_paths.push(ref_path)
    //         fmt_obj['referer_path']=rest
    //         fmt_obj['rootUrls']=rootUrls
    
    //         let target=rule.target_request_url.replace('*','')
    //         let target_urls=[]
    //         target=target.split('*')
    //         target=target.filter(i=>i.length>0)
    //         if(target.length>1){
    //             target_urls.push(target)
    //         }
    //         else{
    //             target_urls.push(target[0])
    //         }
    
    //         fmt_obj['targeturls']=target_urls
    
    //         rootUrls=[]
    //         format_rules.push(fmt_obj)
    //         console.log('Formatted rules...',format_rules)
    //     })
    // }
    // else{
    //     console.log('No enabled rules',enabled_rules)
    // }
    
    return format_rules
}

chrome.storage.local.get(['userID']).then(result=>{
    if(result.userId){
        console.log('User id found');
        userId=result.userId
        registerRules()
    }else{
        console.log('No user Id',result);
    }
})

var reqHeaders=[]

const handlePosts=(rule,request)=>{
    if(rule.methods.includes('POST')){
        chrome.webRequest.onBeforeRequest.addListener(n=>{
            if(n.initiator.includes('chrome-extension')){
                
            }else{
                // console.log(n,request)
                duplicatePostRequest(request.url,n.requestBody,request.requestHeaders,rule.destination,rule.label,n.requestId)
            }
            
        },{urls:[`${rule.url_first}*`]},["requestBody"])
    }
}


async function duplicatePostRequest(url,headers,method,destination,label,reqId,body,page){
    if(req_ids.includes(reqId)){
        console.log('Duplicate : already handled');
    }
    else{
        req_ids.push(reqId)

        console.log("Found valid (POST)",url)

        let target_page=page
        let tabId
        // chrome.tabs.query({url:page+'*'},async(tabs)=>{
        //     tabId=tabs[0].id
        //     let feed = await chrome.tabs.sendMessage(tabId, {duplicate:arguments});

        // })

        // let heads={}
        // headers.forEach(val=>{
        //     heads[val.name]=val.value
        // })

        // fetch(url,{
        //     method:method,
        //     headers:heads,
        //     body:body
        // })
        // .then(async res=>{
        //     if(res.status==200){
        //         let resBody=await res.json()
        //         sendResBody(resBody,url,destination,label,'POST')
    
        //     }else{
        //         console.log('Error duplicating request (POST)',url);
        //         console.log(res);
        //     }
    
        // })

    }

}



let req_ids=[]

const addRuleListeners=(rule_arr)=>{
    req_ids=[]
    
    if(state=='OFF'){
        if(!already){
            already=true
            console.log('Interceptor Turned off');
        }
    }else{
        rule_arr.forEach(rule=>{

            chrome.webRequest.onBeforeSendHeaders.addListener((n)=>{
                if(state=='OFF'){

                }else{
                    if(n.initiator.includes('chrome-extension')){
                        
                    }
                    else{
                        reqHeaders=n.requestHeaders
                        let pageRelevant=false
                        
                        let referer = n.requestHeaders.find(u => u.name.toLowerCase() === "referer").value

                        if(referer.includes(rule.page_first)){
                            pageRelevant=true

                            if(rule.page_rest.length!=0){
                                rule.page_rest.forEach(val=>{
                                    if(!referer.includes(val)){
                                        pageRelevant=false
                                        return true
                                    }
                                })
                            }
                            let urlRelevant=true

                            if(pageRelevant){
                                if(rule.url_rest.length!=0){
                                    rule.url_rest.forEach(vali=>{
                                        if(!n.url.includes(vali)){
                                            urlRelevant=false
                                        }
                                    })
                                }
                            }else{
                                
                            }
                            if(urlRelevant){
                                
                                
                                if(n.method.toUpperCase()=='POST'){
                                    // console.log('Error Duplicating request (POST)');
                                    // handlePosts(rule,n)
                                }
                                else{

                                    duplicateRequest(n.url,reqHeaders,n.method,rule.destination,rule.label,n.requestId)
                                } 
                                

                            }
                            else{

                            }
                                    // console.log('url not relevant',n.url)
            
                            }
                    
                        
                    }
                }
                
                
    
            },{urls:[`${rule.url_first}*`]},["requestHeaders","extraHeaders"])



            //Handling POST REQUESTS
            chrome.webRequest.onBeforeRequest.addListener(m=>{
                if(state=='OFF'){

                }else{
                    if(m.initiator.includes('chrome-extension')){
                        
                    }
                    else{
                        let postPageRelevant=true

                           
                        let urlRelevant=true

                        if(postPageRelevant){
                            if(rule.url_rest.length!=0){
                                rule.url_rest.forEach(vali=>{
                                    if(!m.url.includes(vali)){
                                        urlRelevant=false
                                    }
                                })
                            }
                        }
                        if(urlRelevant){
                            
                            if(m.method.toUpperCase()=='POST' && rule.methods.includes("POST")){
                                // handlePosts(rule,n)
                                duplicatePostRequest(m.url,reqHeaders,m.method,rule.destination,rule.label,m.requestId,m.requestBody,rule.page_first)

                            }
                            else{

                            } 
                            

                        }
                        else{

                        }
                    
                        
                    }
                }
            },{urls:[`${rule.url_first}*`]},["requestBody","extraHeaders"])
        })
        console.log("Rule listeners added")
    }
    
}

chrome.storage.onChanged.addListener((changes,namespace)=>{
    if(namespace=='local'){
        if(changes.taskAdd){
            taskAdd=changes.taskAdd.newValue
            console.log('task:',taskAdd);
        }
        if(changes.userId){
            userId=changes.userId.newValue;
            console.log('userId:',userId);
        }
        if(changes.state){
            console.log(state);
        }


        registerRules()
    }
    
})

let already=false



