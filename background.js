// importScripts('handlePost.js')

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse)=>{
    if(request.setId){
        userId=request.setId
        chrome.storage.local.set({userId:userId}).then(async()=>{
            if(!request.un){
                console.log(`userId:`,userId);
                let rules=await registerRules()
                let schedules=await getSchedules() 
            }
            
            
        })
            
    }

    if(request.setTask){
        taskAdd=request.setTask
        chrome.storage.local.set({taskAdd:taskAdd}).then(async()=>{
            console.log(`task:`,taskAdd);
        })
        
         
    }

    if(request.state){
        state=request.state
        chrome.storage.local.set({state:state}).then(async()=>{
            console.log(request.state);
            if(request.state=='ON' && !request.un){
                let rules=await registerRules()
                let schedules=await getSchedules() 
            }
        })
        
    }

    if(request.fetchSchedules){
        // let schedules=await getSchedules()
        // sendResponse({schedules:schedules})
        // return
    }

    if(request.fetchActions){
        registerActions()
    }

    if(request.fetchRules){
        registerRules()
    }

    if(request.update){
        console.log(`${request.update} tab: ${sender.tab.id}`)
        if(request.update.includes('navig')){
            console.log('loading page...');
            
            if(request.remaining){
                // console.log('Remaining:',request.remaining);
                // console.log('Remaining actions',request.remaining);

                

                chrome.tabs.update(
                    sender.tab.id,
                    {url:request.target,active:true},
                    async(tab)=>{
                        // await sleep(15000)
                        chrome.tabs.onUpdated.addListener(function (tabIdty , info,taby) {
                            
                            if (info.status == 'complete') {
                                
                             
                              if(tab.id==taby.id){
                                console.log('Tab ids:',tab.id,taby.id);
                                console.log('Opened tab finished loading');
                    
                                console.log('Sending the rest to',tab.id);
                                console.log('Remaining:',request.remaining.length);
                                if(request.remaining.length==0){
                                    console.log('Actions finished');
                                    if(request.remove==true){
                                        chrome.tabs.remove(sender.tab.id,()=>{
                                            console.log('Closing tab');
                                        })
                                    }
                                    else{
                                        console.log('Preserving tab');
                                    }
                                }else{
                                    chrome.tabs.sendMessage(tab.id, {performActions:request.remaining,remove:request.remove});
                                }
                              }
                            }
                          });
                        


                    }
                    
                  )


                // if(request.remaining.length!=0){

                //     chrome.tabs.sendMessage(sender.tab.id, {performActions:request.remaining,remove:request.remove});

                // }
            }
        }
        
        if(request.update.includes('tions fini')){
            if(request.remove==true){
                notFinished=sender.tab.id;
                await sleep(5500)
                console.log('Remove set to',request.remove);
                chrome.tabs.remove(sender.tab.id,()=>{
                    console.log('Closing tab');
                })
            }
            else{
                notFinished=false
                console.log('Remove set to',request.remove);
                console.log('Preserving tab');
                
            }
            
        }
        // if(request.proceedFlow){
        //     let action=actionsArr.filter(item=>item.objectId==request.proceedFlow)
        //     let activities=action[0].actions;
        //     console.log(activities.slice(request.position[0],activities.length));
        //     await sleep(5000)
        //     chrome.tabs.sendMessage(sender.tab.id, {
        //         proceedActions:activities,
        //         id:action.objectId,
        //         positions:activities.slice(request.position[1],activities.length)
        //     });
            
        // }

    }

    if(request.proceedActions){

        
        let fl=[...request.proceedActions]

        console.log('Current remainning',fl);
        let target_page
        fl[0].forEach(item=>{
            console.log(item);
            if(item.event){
                if(item.event=='navigate'){
                    target_page=item.target
                }
            }else{
                
            }
        })
        console.log(target_page);
        chrome.tabs.onUpdated.addListener(function (tabIdty , info,tab) {
            if (info.status === 'complete') {
             
              if(tab.url==target_page && tab.windowId==windowId){
                console.log('Navigated page finished loading, continuing');
                let tabId=tab.id
                fl.shift()
                chrome.tabs.sendMessage(sender.tab.id, {performActions:fl,remove:request.remove});
                // let flow=action.actions
                // chrome.tabs.sendMessage(tabId, {startConnect:true,flow:flow,id:action.objectId});
              }
            }
          });
        // await sleep(10000)
        // console.log('Continuing with actions');
        // chrome.tabs.query({windowId:windowId,url:fl[0].target},(tabs)=>{
        //     let tabig=tabs[0].id
        //     console.log(tabs[0]);
        //     fl.shift()
        //     chrome.tabs.sendMessage(sender.tab.id, {performActions:fl});
        // })
        
        
    }
    if(request.startFlow){


        let fl=request.startFlow
        let first=fl[0]
        fl.shift()
        
        if(first){
            console.log('Starting flow:',first);
            let flowTab=sender.tab.id
            if(first.flow[0].event=='navigate'){
                chrome.tabs.onUpdated.addListener(function (tabIdty , info) {
                    if (info.status === 'complete') {
                        console.log(info);
                      // your code ...
                      if(tabIdt==tabId && tab.url==action.target_page){
                        console.log('Opened tab finished loading');
                        let flow=action.actions
                        chrome.tabs.sendMessage(tabId, {startConnect:true,flow:flow,id:action.objectId});
                      }
                    }
                  });
    
                chrome.tabs.sendMessage(flowTab, {tuanze:first,curr:fl,repeat:first.repeat});
                await sleep(5000)
                let sec=fl[0]
                console.log(sec);
                chrome.tabs.sendMessage(flowTab, {tuanze:sec,curr:fl,repeat:sec.repeat});
            }
            else{
                chrome.tabs.sendMessage(flowTab, {tuanze:first,curr:fl,repeat:first.repeat});
            }
        }
        else{
            console.log('Actions finished');
        }
        
        
    }
})

chrome.runtime.onConnect.addListener((port)=>{
    console.log('Conection made',port)
    // let fTab=port.sender.tab.id
    // console.log(fTab);
    port.onMessage.addListener(async(message,port)=>{
        console.log(message);
        if(message.fetchSchedules){
            console.log('NOW RECEIVED SS');
            let schedules=await getSchedules()
            port.postMessage({schedules:schedules})
        }
        if(message.startFlow){
            console.log('Recevied flow',message.startFlow);
            let fl=message.startFlow
            let first=fl[0]

            fl.shift()
            console.log(first);
            let rpt=first.repeat?first.repeat:1
            if(first.flow[0].event=='navigate'){
                let flowID=port.sender.tab.id;
                
                let navFlow=first.flow[0]
                const tempFlow=[first.flow[0]]
                
                port.postMessage({execute:tempFlow,rest:fl,rpt:rpt})

                chrome.tabs.onUpdated.addListener(function (tabIdt , info,tab) {
                    if (info.status === 'complete') {
                      // your code ...
                      if(tabIdt==flowID && tab.url==action.first.flow[0].target){
                        console.log('Opened tab finished loading');
                        let flow=action.actions
                        chrome.tabs.sendMessage(flowID, {startConnect:true,flow:fl,id:action.objectId});
                      }
                    }
                  });

                // first.flow.shift()
                
                // // chrome.tabs.sendMessage(tabId, {startConnect:true,flow:flow,id:action.objectId});
                // await sleep(3000)

                // port.postMessage({execute:first.flow,rest:fl,rpt:rpt})

                // chrome.tabs.sendMessage(flowTab, {tuanze:first,curr:fl,repeat:first.repeat});
                // await sleep(5000)
                // let sec=fl[0]
                // console.log(sec);
                // chrome.tabs.sendMessage(flowTab, {tuanze:sec,curr:fl,repeat:sec.repeat});
            }else{
                port.postMessage({execute:first.flow,rest:fl,rpt:rpt})
            }
            

            // for(let i=1;i<=rpt;i++){
            //     console.log(i);
            //     for(let m=0;m<first.flow.length;m++){
            //         console.log(first.flow[m]);
            //         if(m==first.flow.length-1){
                        
            //         }
            //         else{
            //             let res=await chrome.tabs.sendMessage(fTab,{execute:first.flow[m]}) 
            //         }
                    
            //     }
            // }
        }
    })
})

let heaa={}
let actionsArr

const duplicateRequest=(url,headers,method,destination,label,reqId,origin_page)=>{
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
            sendResBody(resBody,url,destination,label,'GET',origin_page)

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

const sendResBody=(result,url,destination,label,method,origin_page)=>{

    let data={}
    for (const [key, value] of Object.entries(result)) {
        data[key]=value
      }
    console.log(`Successfully duplicated (${method}) ${url} sending...`)
    fetch(destination+'?'+new URLSearchParams({
        user:userId,
        task:taskAdd,
        label:label,
        target_page:origin_page,
        target_url:url
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

    return new Promise(async(resolve,reject)=>{
        if(state=='ON'){
            if(userId){
                console.log('Fetching rules for',userId,' ...')
                let rulesUri=`https://matureshock.backendless.app/api/data/rule?where=userID='${userId}'`
            
                try{
                    let res=await fetch(rulesUri,{
                        method:'GET',
                        headers:{
                            'Content-Type':'application/json'
                        }
                    })

                    if(res.status==200){
                        let result=await res.json()
                        const formatted=await formaT(result)
    
                        if(formatted.length!=0){
                            addRuleListeners(formatted)
                            resolve("Done")
                        }
                        else{
                            resolve(`No rules enabled for ${userId}`)
                        }
    
    
                    }else{
                        resolve(`Error fetching rules for ${userId}`)
                    }

                }
                catch{
                    console.log('Network error.Could not fetch rules');
                    resolve('None')
                }
                

            }else{
                resolve('No user id set')
            }
        }else{
            resolve('OFF')
        }

    })
    
    
    
    // rob-110  
    
}


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

    let actual_first
    let page_first
    let page_rest

    let url_first
    let url_rest

    

    if(rule.target_page_url){
        actual_first=rule.target_page_url
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
                    fmt_obj['origin_page']=actual_first

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
    console.log(`Raw rules for ${userId} :`,raw_rules);

    return new Promise((resolve,reject)=>{
        const format_rules=[]

        let enabled_rules=[]

        raw_rules.forEach(rule=>{
            // If rule.status
            if(rule.rule_status){
                enabled_rules.push(rule)
            }
            
        })

        console.log('Enabled rules...',enabled_rules);

        if(enabled_rules.length>0){
            enabled_rules.forEach(rule=>{
                let rule_status=checkUrls(rule)
                if(rule_status){
                    format_rules.push(rule_status)
                }
            })

            resolve(format_rules)
        }
        else{
            resolve(format_rules)
        }
    })

}

const runEverything=async()=>{
    if(state=='OFF'){
        console.log('Off');
    }
    else{
        state='ON'
        chrome.storage.local.get(['userId']).then(async result=>{
            if(result.userId){
                userId=result.userId
                console.log('User id :',userId);
                let rules=await registerRules()
                getSchedules() 
            }else{
                if(userId){
                    chrome.storage.local.set({userId:userId}).then(()=>{
                        console.log('User id :',userId);   
                    })
                    let rules=await registerRules()
                    getSchedules() 
                }
                else{
                    console.log('No user id');
                }
            }
        })

        
    }
    
}

runEverything()

// chrome.storage.local.get(['userID']).then(async result=>{
//     if(result.userId){
//         userId=result.userId
//         console.log('User id :',userId);
//         let rule_status=await registerRules()
//         console.log(rule_status,'\n','Running Actions');
//         registerActions() 
//     }else{
//         console.log('No user id');
//     }
// })

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
                                    // handlePosts(rule,n)
                                }
                                else{

                                    duplicateRequest(n.url,reqHeaders,n.method,rule.destination,rule.label,n.requestId,referer)
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

// chrome.storage.onChanged.addListener((changes,namespace)=>{
//     if(namespace=='local'){
//         if(changes.taskAdd){
//             taskAdd=changes.taskAdd.newValue
//             console.log('task:',taskAdd);
//   
//         if(changes.userId){
//             userId=changes.userId.newValue;
//             console.log('userId:',userId);
//   
//         if(changes.state){
//             if(changes.state.newValue=='ON'){
//       
//                 registerActions()
//             }
//             console.log(state);
//         }

//     }
    
// })

let already=false

let windowId
let tabId

const sleep=(ms)=> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

const makeWindow=(url,sleeper)=>{
    
    return new Promise(async(resolve,reject)=>{
        if(sleeper){
            await sleep(10000)
        }
        if(windowId){
            chrome.tabs.create({
                url:url,
                windowId:windowId,
                active:true
            },(tab)=>{
                console.log('Adding to old window');
                resolve(tab.id)
            })
            
        }else{
            
            chrome.windows.create({
                focused:false,
                type:'normal',
                
                height:900,
                width:1600,
                // left:60,
                // top:200,
                // state:'maximized',
                url:url
            },(window)=>{
                windowId=window.id
                // chrome.windows.update(windowId,{state:"fullscreen"})
                console.log('making new window');
                resolve(window.tabs[0].id)

            })  
        }
    })
}

let notFinished=true

const runActions=async(tabId,action,remove)=>{

    return new Promise(async(resolve,reject)=>{
        let allActions=action.actions
        let portId=action.objectId
        let spreadActions=[]

        allActions.forEach(item=>{
            let rpt=item.repeat?item.repeat:1
            delete item.repeat
            let arr=[]
            for(let i=1;i<=rpt;i++){
                item.flow.forEach(meth=>{
                    if(item.stop_if_present){
                        meth.stopper=item.stop_if_present
                    }
                    arr.push(meth)
    
                    
                })
            }
            spreadActions.push(arr)
        })

        let allActs=[]
        spreadActions.forEach(item=>{
            item.forEach(cont=>{
                allActs.push(cont)
            })
        })

        console.log(allActs);

        chrome.tabs.sendMessage(tabId, {performActions:allActs,remove:remove});
        while(notFinished==true){
            await sleep(5000)
        }

        if(notFinished==false){
            resolve('new')
            notFinished=true
        }
        else{
            resolve(notFinished)
            notFinished=true
        }

        

    })
    
    


    

    // for (let i=0;i<spreadActions.length;i++){
    //     if(spreadActions[i].event=='navigate'){
    //         console.log('navigating now');
    //         let res=await chrome.tabs.sendMessage(tabId, {doSingle:spreadActions[i]});
    //         console.log('Searching tab',spreadActions[i].target);
    //         await sleep(10000)
    //         chrome.tabs.query(
    //             {url:spreadActions[i].target,windowId:windowId},(tab)=>{
    //                 console.log(tab);
    //                 tabId=tab[0].id
    //             }
                
    //           )
            
    //     }
    //     else{
    //         let res=await chrome.tabs.sendMessage(tabId, {doSingle:spreadActions[i]});
    //     }
    //     await sleep(1000)
    // }
    

}

const interact=async(actions)=>{

    actions=actions.filter(item=>item.userID==userId)
    // actions=actions.filter(item=>item.name!='Example 4')
    console.log('Formatted actions for ',userId,actions);

    let runningTab
    for(let i=0;i<actions.length;i++){
        
        let tabId=await makeWindow(actions[i].target_page,false)

        console.log(actions[i]);
        

        const checkCompletion=(action)=>{
            return new Promise(async(resolve,reject)=>{
                chrome.tabs.onUpdated.addListener(async function async(tabIdt , info,tab) {
                // console.log(tabIdt);
                // console.log(tab);
                if (info.status === 'complete') {
                    // console.log(info);
                // your code ...
                if(tabIdt==tabId && tab.url==action.target_page){
                    console.log('Opened tab finished loading');
                    let remove=true

                    if(typeof(action.remove)=='undefined' || action.remove==null ){
                        remove=true

                    }else{
                        remove=action.remove 
                    }

                    console.log('Remove value set to',remove);
                    
                    let flow=action.actions
                    let statusss=await runActions(tabId,action,remove)
                    resolve(statusss)
                    // chrome.tabs.sendMessage(tabId, {startConnect:true,flow:flow,id:action.objectId});
                    
                }
                }
            });
            })
        }


        let comp=await checkCompletion(actions[i])

       
        // await sleep(120000)



        
    }

    actions.forEach(async (action,indx)=>{
        
        
        
        // let flow=action.actions
        // chrome.tabs.sendMessage(tabId, {startConnect:true,flow:flow,id:action.objectId});

        

        

        // for(let i=0;i<action.actions.length;i++){
        //     await sleep(3000)
        //     let flow=action.actions[i].flow
        //         for(let k=0;k<flow.length;k++){
        //             chrome.tabs.sendMessage(tabId, {makeFlow:flow[k]});
        //         }
        //     // for(let j=0;j<action.actions[i].repeat;j++){
        //     //     // console.log(action.actions[i].flow);
                
                
        //     // }
            
        // }
        
        
        
    })
    
    
}

const getSchedules=()=>{
    return new Promise(async(resolve,reject)=>{
        console.log('Fetching schedules');
        let schedulesUrl=`https://matureshock.backendless.app/api/data/schedules?where=userID%3D'${userId}'`
        
        try{
            let res=await fetch(schedulesUrl,{
                method:'GET',
                headers:{
                    'Content-Type':'application/json'
                }
            })

            if(res.status==200){
               
                let result=await res.json()
                console.log('Schedules...',result);
                // handleSchedules(result)
                resolve(result)

            }else{
                resolve(`Error fetching schedules for ${userId}`)
            }

        }
        catch{
            console.log('Network error.Could not fetch schedules');
            resolve('None')
        }
    })
    
}

const handleSchedules=async(arr)=>{

}



const registerActions=()=>{
    // userId=userId.replace("'","")
    // return
    
    if(state=='ON'){
        if(userId){
            console.log(`Fetching actions for ${userId}`)
            // let actionsUri=`https://matureshock.backendless.app/api/data/action?userID=`
            let actionsUri=`https://matureshock.backendless.app/api/data/action?pageSize=100&where=userID='${userId}'`
            fetch(actionsUri,{
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
    
                console.log('actions...',result);
                actionsArr=result

                interact(result)
                
        
            })
        }else{
            console.log('No user id');
        }
    }else{
        console.log('Interceptor OFF')
    }
    
    
    // rob-110  
    
}



