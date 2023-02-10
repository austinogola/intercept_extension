importScripts('handlePost.js')

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse)=>{
    if(request.setId){
        console.log('set id request received');
        userId=request.setId
        chrome.storage.local.set({userId:request.setId}).then(()=>{
            console.log(`Set userId to`,userId);
            registerRules()
            
        })
    }

    if(request.setTxt){
        console.log('set text request received');
        textAdd=request.setTxt
        chrome.storage.local.set({textAdd:request.setTxt}).then(()=>{
            console.log(`Set text  to `,textAdd);
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

const duplicateRequest=(url,headers,method,destination)=>{
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
        headers:heads
    })
    .then(async res=>{
        if(res.status==200){
            let resBody=await res.json()
;            sendResBody(resBody,url,destination)

        }else{
            console.log('could not duplicate',url);
        }

    })
}

var userId
var textAdd
var state

const sendResBody=(result,url,destination)=>{
    // let sendTourl='https://webhook.site/6231e712-dc6d-4941-8ed8-4bcb7ee86182'

    let sendTourl='https://webhook.site/eeef82a2-9a7a-40aa-b089-7272fcb6ebb6'

    // https://webhook.site/#!/a722a152-9598-4748-b573-ef97ddb43100/ffcd211c-7b63-48c9-b093-efa32705985c/1

    let data={}
    for (const [key, value] of Object.entries(result)) {
        data[key]=value
      }
    console.log('Successfully duplicated ',url,'sending...')
    fetch(destination+'?'+new URLSearchParams({
        user:userId,
        text:textAdd
    }),{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
        // body:JSON.stringify({name:'Austo'})
    })
    .then(res=>{
        if(res.status==200){
            console.log('Successfully sent response body '+ 'to ',destination);
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
                let target_parents=[]
                let target_paths=[]
                let methods=[]
                let dests=[]
                result.forEach(rule=>{
                    target_parents.push(rule.target_page_url)
                    // target_request_url=rule.target_request_url.replace('*','')
                    target_paths.push(rule.target_request_url)
                    methods.push(rule.target_request_method[0])
                    dests.push(rule.destination_webhook_url)
                })
        
                if(target_parents.length!==0 && target_paths.length!=0 && methods.length!=0 && dests.length!=0){
                    console.log('Formating rules...');
                    const formatted=formaT(result)
                    if(formatted.length)
                    addRuleListeners(formatted)
                }
                else{
                    console.log('Error fetching all the rules');
                    // console.log(result);
                }
                // addIntpt(target_parents,target_paths,methods,dests)
                
        
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
        console.log('Enabled rules',enabled_rules)
        let rootUrls=[]

        enabled_rules.forEach(rule=>{
            let fmt_obj={}
            
            fmt_obj['destination']=rule.destination_webhook_url
            fmt_obj['label']=rule.rule_label
            fmt_obj['methods']=rule.target_request_method
    
            
            let page_arr=rule.target_page_url.replaceAll('*','').split('/').filter(i=>i.length>0)
    
            let head=page_arr[0]
            rootUrls.push(`*://*.${head}/*`)
            rootUrls.push(`*://*/${head}/*`)
    
            let rest=page_arr.length>1?page_arr.slice(1):null
            // console.log(new URL(head))
            // referer_paths.push(rest)
            // rest_paths.push(ref_path)
            fmt_obj['referer_path']=rest
            fmt_obj['rootUrls']=rootUrls
    
            let target=rule.target_request_url.replace('*','')
            let target_urls=[]
            target=target.split('*')
            target=target.filter(i=>i.length>0)
            if(target.length>1){
                target_urls.push(target)
            }
            else{
                target_urls.push(target[0])
            }
    
            fmt_obj['targeturls']=target_urls
    
            rootUrls=[]
            format_rules.push(fmt_obj)
            console.log('Formatted rules...',format_rules)
        })
    }
    else{
        console.log('No enabled rules',enabled_rules)
    }
    
    return format_rules
}

chrome.storage.local.get(['userID']).then(result=>{
    if(result.userId){
        console.log('User id found');
    }else{
        console.log('No user Id',result);
    }
})

var reqHeaders=[]

const addRuleListeners=(rule_arr)=>{
    

    if(state=='OFF'){
        if(!already){
            already=true
            console.log('Interceptor Turned off');
        }
    }else{
        console.log('Formatted rules...',rule_arr)
        rule_arr.forEach(rule=>{
            chrome.webRequest.onBeforeSendHeaders.addListener((n)=>{
                if(state=='OFF'){

                }else{
                    if(n.initiator.includes('chrome-extension')){
                        console.log('Extension request')
                    }
                    else{
                        reqHeaders=n.requestHeaders
                        if(n.method.toUpperCase()=='POST'){
    
                        }else{
                            if(rule.targeturls){
                                if(rule.targeturls.length==1){
                                    
                                    if(n.url.includes(rule.targeturls[0])){
                                        if(rule.methods.includes(n.method.toUpperCase())){
                                            duplicateRequest(n.url,reqHeaders,n.method,rule.destination)
                                        }
                                        
                                    }else{
                                        // console.log('not valid')
                                        // console.log(n.url)
                                    }
                                }
                                else if(rule.targeturls.length>1){
                                    if(n.url.includes(rule.targeturls[0]) && n.url.includes(rule.targeturls[1])){
                                        if(rule.methods.includes(n.method.toUpperCase())){
                                            duplicateRequest(n.url,reqHeaders,n.method,rule.destination)
                                        }
                                    }
                                    else{
                                        // console.log('not valid')
                                        // console.log(n.url)
                                    }
                                }
                            }
                        }
                        
                    }
                }
                
                
    
            },{urls:rule.rootUrls},["requestHeaders","extraHeaders"])
        })
        console.log("Rule listeners added")
    }
    
}

chrome.storage.onChanged.addListener((changes,namespace)=>{
    if(namespace=='local'){
        if(changes.textAdd){
            textAdd=changes.textAdd.newValue
            console.log('text:',textAdd);
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

const addIntpt=(parents,paths,methods,destinations)=>{


    const regex = /[^A-Za-z0-9]/g;
    let parenturls=[]
    referer_paths=[]
    parents.forEach(ref=>{
        
        // initiator=initiator.replace(regex,'')
        ref_arr=ref.split('/')
        let head=ref_arr[0].replace('*','')
        ref_arr.shift()
        let rest=ref_arr.join('/').replace('*','')
        // ref_arr.shift()
        // ref_path=ref_arr.join('/')
        // let end=initiator.split('.')[1].replace(regex,'')
        parenturls.push(`*://*.${head}/*`)
        referer_paths.push(rest)
        // rest_paths.push(ref_path)
    })

    let target_urls=[]


    paths.forEach(path=>{
        path=path.replace('.','')
        path=path.split('*')
        path=path.filter(i=>i.length>0)
        if(path.length>1){
            target_urls.push(path)
        }
        else{
            target_urls.push(path[0])
        }
        
    })

   

    let meths=methods

    // methods.forEach(arr=>{
    //     arr.forEach(val=>{
    //         meths.push(val)
    //     })
    // })

    const destination=destinations[0]

    console.log(parenturls,referer_paths,target_urls,meths,destination);


    chrome.webRequest.onBeforeSendHeaders.addListener((n)=>{
        if(state=='OFF'){
            if(!already){
                already=true
                console.log('Interceptor Turned off');
            }
        }
        else{
            if(n.initiator.includes('chrome-extension')){

            }else{
                let heads=n.requestHeaders
                let referer
                heads.forEach(header=>{
                    if(header.name.toLowerCase()=='referer'){
                        referer=header.value
                    }
                })

                if(referer){
                    let referer_relevant=false

                    referer_paths.forEach(path=>{
                        if(referer.includes(path)){
                            referer_relevant=true
                        }
                    })
                    if(referer_relevant){
                        let req_url=n.url
                        target_urls.every(tgt=>{
                            if(Array.isArray(tgt)){
                                if(req_url.includes(tgt[0]) && req_url.includes(tgt[1])){
                                    let allHeaders=n.requestHeaders 
                                    duplicateRequest(n.url,allHeaders,n.method,destination)
                                    return false
                                }else{
                                    return true
                                }
                            }else{
                                if(req_url.includes(tgt)){
                                    let allHeaders=n.requestHeaders
                                    duplicateRequest(n.url,allHeaders,n.method,destination)
                                    return false
                        
                                }else{
                                    return true
                                    // console.log('Baadd',req_url,tgt)
                                }
                            }
                            
                        })
                    }
                }

                


                // if(n.method=='GET'){
                //     let whole=new URL(n.url)
                //     let relevant=false
                //     let refff=false
                    
                //     let reF=''

                //     n.requestHeaders.forEach(header=>{
                //         if(header.name=='Referer'){
                //             reF=header.value
                //         }
                //     })

                //     console.log('Referer is',reF );

                //     rest_paths.forEach(pp=>{
                //         if(reF.includes(pp)){
                //             refff=true
                //         }
                //     })




                //     let pathQu=whole.pathname+whole.search
    
                //     target_urls.forEach(path=>{
                //         if(pathQu.includes(path)){
                //             relevant=true    
                //         }
                //     })
    
    
                //     if(relevant && refff){
                //         let domain=n.initiator.split('www.')[1]
                //         allHeaders=n.requestHeaders
                //         duplicateRequest(n.url,allHeaders,n.method,destination)
                //         // console.log('Relevant', n.url);
        
                //         // chrome.cookies.getAll({domain:domain},allCks=>{
                            
                //         // })
                //     }else{
                //         console.log('Not relevant',n.url);

                //     }
                // }  
    
            }
        }
    },{
        urls:parenturls
    },["requestHeaders","extraHeaders"])

}





// chrome.webRequest.onBeforeSendHeaders.addListener(
//     function(details) {
//     //   for (var i = 0; i < details.requestHeaders.length; ++i) {
//     //     if (details.requestHeaders[i].name === 'User-Agent') {
//     //       details.requestHeaders.splice(i, 1);
//     //       break;
//     //     }
//     //   }
//     //   return {requestHeaders: details.requestHeaders};
//     // console.log(details.requestHeaders);
//     let reqId=details.requestId
//     let tabId=details.tabId
//     let allHeaders=details.requestHeaders
//     let domain=details.initiator.split('www.')[1]
//     if(details.initiator.includes('chrome-extension')){
        
//     }else{
//         chrome.cookies.getAll({domain:domain},allCks=>{
//             duplicateRequest(details.url,allHeaders,allCks)
//         })
//     }   
//     },
//     {urls: [
//         "https://www.linkedin.com/voyager/api/feed/*",
//         'https://www.linkedin.com/voyager/api/relationships/*',
//         'https://www.linkedin.com/voyager/api/growth/*'
//     ]},
//     ["requestHeaders"]
//   );

   


// chrome.webRequest.onBeforeRequest.addListener(initialListener, {
//     urls: ['https://www.linkedin.com/li/track*']
// }, ["requestBody"]
// );

// var gAttached = false;
// var gRequests = [];
// var gObjects = [];

// chrome.debugger.onEvent.addListener((source, method, params)=>{
//     if (method == "Network.requestWillBeSent") {
//         // If we see a url need to be handled, push it into index queue
//         var rUrl = params.request.url;
//         gRequests.push(rUrl);
//     }

//     if (method == "Network.responseReceived") {
//         // We get its request id here, write it down to object queue
//         var eUrl = params.response.url;

//         gObjects.push({
//             requestId: params.requestId,
//             url: eUrl
//         });
//     }

//     if (method == "Network.loadingFinished" && gObjects.length > 0) {
//         var requestId = params.requestId;
//         var object = null;
//         for (var o in gObjects) {
//             if (requestId == gObjects[o].requestId) {
//                 object = gObjects.splice(o, 1)[0];
//                 break;
//             }
//         }

//         if (object == null) {
//             console.log('Failed!!');
//             return;
//         }
//         gRequests.splice(gRequests.indexOf(object.url), 1);

//         chrome.debugger.sendCommand(source,'Network.getResponseBody',{"requestId": requestId},
//         (response)=>{
//             if (response) {
//                 dispatch(source.tabId, object.target, JSON.parse(response.body));
//             } else {
//                 console.log("Empty response for " + object.url);
//             }

//             // If we don't have any request waiting for response, re-attach debugger
//                     // since without this step it will lead to memory leak.
//             if (gRequests.length == 0) {
//                 chrome.debugger.detach(
//                     {tabId: source.tabId},
//                     ()=>{
//                         chrome.debugger.attach({
//                             tabId: source.tabId
//                         },'1.0',()=>{
//                             chrome.debugger.sendCommand({
//                                 tabId: source.tabId
//                             },'Network.enable')
//                         })
//                     }
//                 )
//             }
//         })
//     }


// })


// var initialListener = function (details) {
//     if (gAttached) return;  // Only need once at the very first request, so block all following requests
//     var tabId = details.tabId;
//     if (tabId > 0) {
//         gAttached = true;
//         chrome.debugger.attach({
//             tabId: tabId
//         }, "1.0", function () {
//             chrome.debugger.sendCommand({
//                 tabId: tabId
//             }, "Network.enable");
//         });
//         // Remove self since the debugger is attached already
//         chrome.webRequest.onBeforeRequest.removeListener(initialListener);
//     }
// };

// chrome.webRequest.onBeforeRequest.addListener(initialListener, {urls: ["https://www.linkedin.com/li/track"]}, ["blocking"]);



// Register a listener for the webRequest API to intercept HTTP responses
// var requests = {};

// // Register a listener for the webRequest API to intercept HTTP requests
// chrome.runtime.onMessage.addListener(async (request, sender) => {
//     if (request.command === 'intercept_request') {
//       // Interception starts
//       const { requestId } = request;
//       browser.debugger.attach({tabId: sender.tab.id}, "1.0", () => {
//         browser.debugger.sendCommand({tabId: sender.tab.id}, "Network.enable", {}, () => {
//           browser.debugger.sendCommand({tabId: sender.tab.id}, "Network.setRequestInterception", {patterns: [{urlPattern: "*://*.example.com/*", interceptionStage: "HeadersReceived"}]}, () => {
//             browser.debugger.onEvent.addListener((debuggeeId, message, params) => {
//               if (message === "Network.requestIntercepted" && params.requestId === requestId) {
//                 browser.debugger.sendCommand({tabId: sender.tab.id}, "Network.getResponseBody", {requestId: requestId}, (response) => {
//                   console.log(response.body);
//                   browser.debugger.sendCommand({tabId: sender.tab.id}, "Network.continueInterceptedRequest", {interceptionId: params.interceptionId}, () => {});
//                 });
//               }
//             });
//           });
//         });
//       });
//     }
//   });


