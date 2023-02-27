chrome.runtime.onMessage.addListener(async(request,sender,sendResponse)=>{
    if(request.duplicate){
      console.log(request.duplicate);
      duplicateRequest(request.duplicate)
    }

    if(request.performActions){
        // let mm=await runArray(request.performActions)
        // console.log(mm);
        wholeArr(request.performActions)
    }

    if(request.doSingle){
        // await sleep(5000)
        handleSingle(request.doSingle)
        sendResponse({meso:request.doSingle})
        // return ({meso:'done'})
        
    }

    if(request.startActions){
        console.log('Received actions', request.startActions);
        startFlowing(request.startActions,request.id,null)
    }



    if(request.tuanze){
        console.log(request);
        // handleTuanze(request)
    }
    if(request.execute){
        console.log(request);
        
        handleProper(request.execute)
        
    }

    if(request.startConnect){
        // chrome.runtime.sendMessage({startFlow:request.flow})
        flow=request.flow
        let myport=chrome.runtime.connect({name:request.id})
        myport.onMessage.addListener(async(meso)=>{
            if(meso.startFlow){
                console.log(meso.startFlow);
                myport.postMessage({received:'ukweli'})
            }
            if(meso.execute){
                console.log(meso);
                let remaining=await handleExecute(meso.execute,meso.rpt,meso.rest)
                console.log('Sending remaining');
                myport.postMessage({startFlow:remaining})

                // handleProper(meso.execute)
                // .then(()=>{
                //     myport.postMessage({startFlow:meso.rest})
                // })
            }
            
        })
        myport.postMessage({startFlow:request.flow})
    }
  
  })

  const wholeArr=async(arr)=>{
    let remaining=[...arr]
    for(let i=0;i<arr.length;i++){
        let res=await runArray(arr[i],remaining)
        remaining.shift()
    }
    chrome.runtime.sendMessage({update:`Actions finished...`})

  }

  const handlePerform=async(arr)=>{
    return new Promise(async(resolve,reject)=>{
        for(let i=1;i<=repetitions;i++){
            let men=await runArray(arr)
            console.log('Finished repetition ',i,' for ',men)
            await sleep(1500)
            
            // await sleep(1000)
        }
        resolve(remaining)
    })
    
}

const handleSingle=async(obj)=>{
    await runTidBit(obj)
}

const handleExecute=async(arr,repetitions,remaining)=>{
    return new Promise(async(resolve,reject)=>{
        for(let i=1;i<=repetitions;i++){
            let men=await runArray(arr)
            console.log('Finished repetition ',i,' for ',men)
            await sleep(1500)
            
            // await sleep(1000)
        }
        resolve(remaining)
    })
    
}

const runTidBit=async(obj,remaining)=>{
    return new Promise(async(resolve,reject)=>{
        if(obj.wait){
            console.log('Sleeping');
            await sleep(obj.wait*1000)
            chrome.runtime.sendMessage({update:`Waited ${obj.wait} seconds...`})
            resolve(`Performed `,obj)  
        }
        else if(obj.event){
            
            if(obj.event=='click'){
                let stopper
                if(obj.stopper){
                    chrome.runtime.sendMessage({update:`this has a stop sign, checking...`})
                    stopper=$(obj.stopper)[0]
                }
                chrome.runtime.sendMessage({update:`searching ${obj.target}`})
                let el=await loadSelector(obj.target)
                if(stopper){
                    chrome.runtime.sendMessage({update:`stop element found, STOPPING`})
                    resolve(`Stop`)  
                }else{
                    chrome.runtime.sendMessage({update:`stop element absent, proceeding`})
                    chrome.runtime.sendMessage({update:`found,clicking ${obj.target}`})
                    console.log('clicking');
                    el.click();
                    resolve(`Performed`)  
                }
                
                
            }
            else if(obj.event=='scroll'){
                console.log('scroll event');
                if(obj.target){
                    chrome.runtime.sendMessage({update:`searching ${obj.target}`})
                    let el=await loadSelector(obj.target)
                    let parent=el.parentNode
                    let grand=parent.parentNode
                    let child=el.firstChild
                    let granCh=child.firstChild
                    setTimeout(() => {
                        chrome.runtime.sendMessage({update:`found, scrolling ${obj.target}`})
                        parent.scrollBy({top:obj.depth,behavior:'smooth'})
                        grand.scrollBy({top:obj.depth,behavior:'smooth'})
                        child.scrollBy({top:obj.depth,behavior:'smooth'})
                        granCh.scrollBy({top:obj.depth,behavior:'smooth'})
                        el.scrollBy({top:obj.depth,behavior:'smooth'})
                        // parent.scroll(0,obj.depth)
                        // grand.scroll(0,obj.depth)
                        // child.scroll(0,obj.depth)
                        // granCh.scroll(0,obj.depth)
                        // el.scroll(0,obj.depth)
                        resolve(`Performed`,obj)  
                        // sendResponse({done:true})
                    }, 50);
                    
                }else{
                    console.log('To scroll main');
                    setTimeout(() => {
                        console.log('Scrolling',obj.depth);
                        chrome.runtime.sendMessage({update:`scrolling main window`})
                        window.scrollBy({top:obj.depth,behavior:'smooth'})  
                        // window.scroll(0,obj.depth) 
                        resolve(`Performed`,obj)  
                        // sendResponse({done:true})
                    }, 50);
                }
            }
            else if(obj.event=='navigate'){
                    console.log('Navigating to',obj.target);
                    chrome.runtime.sendMessage({update:`navigating to ${obj.target}`})
                    window.location.href=obj.target
                    chrome.runtime.sendMessage({proceedActions:remaining})
                    
                    // setTimeout(()=>{
                        
                    // },1000)
            }
        }
    })
}
let runF=[]


let runArray=async(arr,rem)=>{
    return new Promise(async(resolve,reject)=>{
        for(let m=0;m<arr.length;m++){
            let perfomed=await runTidBit(arr[m],rem)
            console.log(perfomed);
            if(perfomed=='Stop'){
                resolve('Stop')
                break  
            }
            if(m==arr.length-1){
                resolve('continue')
            }
        }
        
    })
}
let flow
window.addEventListener('load',(ev)=>{
    console.log('Window loaded,proceeding');
    if(flow){
        console.log('Flow is present');
    }else{
        console.log('There is no flow present');
    }
   
})
const  loadSelector=async(selector,query)=> {
    var raf;
    var found = false;
    let el

    return new Promise((resolve,reject)=>{
        (function check(){
            if(query){
                // el = document.querySelector(selector)
                // el=document.querySelector("#match-odds > div.d-flex.flex-column.bg-light > div.ml-pagination.d-flex.align-center.justify-space-between.bg-grey-5 > button.ml-pagination__btn.ml-pagination__btn--next.disabled > i")
                el=$(selector)[0]
                // el=document.evaluate('/html/body/div[1]/div[2]/div/div[1]/div[2]/div[2]/div/div/main/div[2]/div[1]/div[1]/div[2]/button[2]',document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;


            }else{
                // el = document.evaluate(selector,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
                el=$(selector)[0]
            }
            
            if (el) {
                found = true;
                cancelAnimationFrame(raf);
                console.log('Finally found',el);
                resolve(el)
                
                if(!found){
                raf = requestAnimationFrame(check);
                }
                
            
            } else {
                raf = requestAnimationFrame(check);
            }
            })();
    })

    
}

const handleProper=async(item)=>{
    console.log(item);
    const  loadSelector=async(selector,query)=> {
        var raf;
        var found = false;
        let el
    
        return new Promise((resolve,reject)=>{
            (function check(){
                if(query){
                    // el = document.querySelector(selector)
                    // el=document.querySelector("#match-odds > div.d-flex.flex-column.bg-light > div.ml-pagination.d-flex.align-center.justify-space-between.bg-grey-5 > button.ml-pagination__btn.ml-pagination__btn--next.disabled > i")
                    el=$(selector)[0]
                    // el=document.evaluate('/html/body/div[1]/div[2]/div/div[1]/div[2]/div[2]/div/div/main/div[2]/div[1]/div[1]/div[2]/button[2]',document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;


                }else{
                    // el = document.evaluate(selector,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
                    el=$(selector)[0]
                }
                
                if (el) {
                    found = true;
                    cancelAnimationFrame(raf);
                    console.log('Finally found',el);
                    resolve(el)
                    
                    if(!found){
                    raf = requestAnimationFrame(check);
                    }
                    
                
                } else {
                    raf = requestAnimationFrame(check);
                }
                })();
        })
    
        
    }
        item.forEach(async item=>{
            if(item.wait){
                await sleep(item.wait*1000)  
            }
            else if(item.event){
                console.log('We have an event',item.event);
                if(item.event=='click'){
                    let el=await loadSelector(item.target)
                    console.log('clicking');
                    el.click();
                    
                }
                else if(item.event=='scroll'){
                    if(item.target){
                        let el=await loadSelector(item.target)
                        let parent=elmt.parentNode
                        let grand=parent.parentNode
                        let child=elmt.firstChild
                        let granCh=child.firstChild
                        setTimeout(() => {
                            parent.scroll()
                            grand.scroll()
                            child.scroll()
                            granCh.scroll()
                            el.scroll()
                            // sendResponse({done:true})
                        }, 50);
                        
                    }else{
                        console.log('To scroll main');
                        setTimeout(() => {
                            console.log('Scrolling',item.depth);
                            window.scroll({top:obj.depth,behavior:'smooth'})  
                            // sendResponse({done:true})
                        }, 50);
                    }
                }
            }
        })

    


    
    

    return new Promise((resolve,reject)=>{
        resolve('done')
    })
}

const handleTuanze=async(obj)=>{
    const  loadSelector=async(selector,query)=> {
        var raf;
        var found = false;
        let el
    
        return new Promise((resolve,reject)=>{
            (function check(){
                if(query){
                    // el = document.querySelector(selector)
                    // el=document.querySelector("#match-odds > div.d-flex.flex-column.bg-light > div.ml-pagination.d-flex.align-center.justify-space-between.bg-grey-5 > button.ml-pagination__btn.ml-pagination__btn--next.disabled > i")
                    el=$(selector)[0]
                    // el=document.evaluate('/html/body/div[1]/div[2]/div/div[1]/div[2]/div[2]/div/div/main/div[2]/div[1]/div[1]/div[2]/button[2]',document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;


                }else{
                    // el = document.evaluate(selector,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
                    el=$(selector)[0]
                }
                
                if (el) {
                    found = true;
                    cancelAnimationFrame(raf);
                    console.log('Finally found',el);
                    resolve(el)
                    
                    if(!found){
                    raf = requestAnimationFrame(check);
                    }
                    
                
                } else {
                    raf = requestAnimationFrame(check);
                }
                })();
        })
    
        
    }
    
    let flow=obj.tuanze.flow
    let rpt=obj.tuanze.repeat
    let stop_if_present
    // stop_if_present=obj.tuanze.stop_if_present
    // console.log('stop',stop_if_present);
    let stop_sign
    let stopy
    // if(stop_if_present){
    //     stop_sign=loadSelector(stop_if_present,true).then(res=>{
    //         console.log(res);
    //         chrome.runtime.sendMessage({update:"Stop element found.Stopping..."})
    //         stopy=true
    //         return
    //     })
    // }
    

    for(let m=1;m<=rpt;m++){
        chrome.runtime.sendMessage({update:`itiration ${m}`})
        for(let i=0;i<flow.length;i++){
            if(flow[i].wait){
                console.log('Waiting');
                await sleep(flow[i].wait*1000)
                chrome.runtime.sendMessage({update:`Waited ${flow[i].wait} seconds...`})
                
            }
            else if(flow[i].event){
                if(flow[i].event=='click'){
                    console.log('Clickng');
                    if(false){
                        console.log(stop_sign);
                        console.log('Stop element found.Stopping...');
                        chrome.runtime.sendMessage({update:"Stop element found.Stopping..."})
                        break
                    }
                    else{
    
                        chrome.runtime.sendMessage({update:`searching ${flow[i].target}`})
                        let elmt=await loadSelector(flow[i].target)
                        chrome.runtime.sendMessage({update:`found ${flow[i].target} ,clicking'`})
                        elmt.click()
                    }
                    
                }
                
                else if(flow[i].event=='scroll'){

                    console.log('Scrolling');
                    if(flow[i].target){
                        chrome.runtime.sendMessage({update:`searching ${flow[i].target}`})
                        let elmt=await loadSelector(flow[i].target)
                        let parent=elmt.parentNode
                        let grand=parent.parentNode
                        let child=elmt.firstChild
                        let granCh=child.firstChild
                        let probs=[elmt,parent,grand,child,granCh]
                        console.log('scrolling element',flow[i].target,'found,scrolling');
                        chrome.runtime.sendMessage({update:`found${flow[i].target} ,scrolling`})
                        try {
                            let times=flow[i].depth/50
                            let intv=3000/times
                            let count=0
                            let scc=setInterval(()=>{
                                if(count>=times){
                                    clearInterval(scc)
                                }
                                elmt.scroll({top:flow[i].depth,behavior:'smooth'})
                                parent.scroll({top:flow[i].depth,behavior:'smooth'})
                                grand.scroll({top:flow[i].depth,behavior:'smooth'})
                                child.scroll({top:flow[i].depth,behavior:'smooth'})
                                granCh.scroll({top:flow[i].depth,behavior:'smooth'})
                                count+=1
                            },intv)
                            
                        } catch (error) {
                            console.log(elmt, ' not scrollable');
                            chrome.runtime.sendMessage({update:`${flow[i].target} not scrollable`})
                        }
                    }else{
                        console.log('Scrolling main page');
                        let times=flow[i].depth/50
                        let intv=3000/times
                        let count=0
                        // let scc=setInterval(()=>{
                        //     if(count>=times){
                        //         clearInterval(scc)
                        //     }
                        //     window.scroll({top:flow[i].depth,behavior:'smooth'})
                        //     count+=1
                        // },intv)
                        setTimeout(() => {
                            window.scroll({top:flow[i].depth,behavior:'smooth'})  
                        }, 50);
                        
                        chrome.runtime.sendMessage({update:"Scrolling main page"})
                    }
                    
                }
                else if(flow[i].event=='navigate'){
                    console.log('Navigating to',flow[i].target);
                    chrome.runtime.sendMessage({
                        update:`navigating to ${flow[i].target}`,
                        // proceedFlow:id,
                        // position:[i,k+1]
                    })
                    setTimeout(()=>{
                        window.location.href=flow[i].target
                    },2000)
                    
                    // chrome.runtime.sendMessage({setWatch:true})
                    return
                    
                }
            }
        }
    }
    
    chrome.runtime.sendMessage({startFlow:obj.curr})
}


const handleFlow=async (obj)=>{
    const  loadSelector=async(selector,query)=> {
        var raf;
        var found = false;
        let el
    
        return new Promise((resolve,reject)=>{
            (function check(){
                if(query){
                    // el = document.querySelector(selector)
                    el=document.evaluate('/html/body/div[1]/div[2]/div/div[1]/div[2]/div[2]/div/div/main/div[2]/div[1]/div[1]/div[2]/button[2]',document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
                    // el=document.querySelector("#match-odds > div.d-flex.flex-column.bg-light > div.ml-pagination.d-flex.align-center.justify-space-between.bg-grey-5 > button.ml-pagination__btn.ml-pagination__btn--next.disabled > i")

                }
                else{
                    el = document.evaluate(selector,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;

                }
                
                if (el) {
                    found = true;
                    cancelAnimationFrame(raf);
                    console.log('Finally found',el);
                    resolve(el)
                    
                    if(!found){
                    raf = requestAnimationFrame(check);
                    }
                    
                
                } else {
                    raf = requestAnimationFrame(check);
                }
                })();
        })
    
        
    }

    console.log(obj);
    if(obj.wait){
        console.log('Waiting');
        chrome.runtime.sendMessage({update:`Waiting ${obj.wait} seconds...`})
        await sleep(obj.wait*1000)
    }
    else if(obj.event){
        if(obj.event=='click'){
            console.log('Clickng');
            if(false){
                console.log('Stop element found.Stopping...');
                chrome.runtime.sendMessage({update:"Stop element found.Stopping..."})
            }
            else{
                chrome.runtime.sendMessage({update:`searching for ${obj.target}`})
                let elmt=await loadSelector(obj.target)
                console.log(obj.target,'found,clicking');
                chrome.runtime.sendMessage({update:`${obj.target} found,clicking'`})
                elmt.click()
            }
            
        }
        else if(obj.event=='scroll'){
            console.log('Scrolling');
            await sleep(1000)
            if(obj.target){
                chrome.runtime.sendMessage({update:`searching for ${obj.target}`})
                let elmt=await loadSelector(obj.target)
                console.log(obj.target,'found,scrolling');
                chrome.runtime.sendMessage({update:`${obj.target} found,scrolling`})
                try {
                    elmt.scrollBy(0,obj.depth)
                } catch (error) {
                    console.log(elmt, ' not scrollable');
                    chrome.runtime.sendMessage({update:`${obj.target} not scrollable`})
                }
            }else{
                console.log('Scrolling main page');
                chrome.runtime.sendMessage({update:"Scrolling main page"})
                window.scrollBy(0,obj.depth)
            }
            
        }
        else if(obj.event=='navigate'){
            console.log('Navigating to',obj.target);
            window.location.href=obj.target
            chrome.runtime.sendMessage({
                update:`navigating to ${obj.target}`,
                // proceedFlow:id,
                // position:[i,k+1]
            })
            
        }
    }
    
}

const startFlowing=async (actions,id,positions)=>{

    console.log(actions);

    let a=0
    let b=0
    // if(positions){
    //     a=positions[0]
    //     b=positions[1]
    // }

    
    for(let i=a;i<actions.length;i++){
        for(let j=0;j<actions[i].repeat;j++){
            console.log(`initiating ${getOrdinal(i)}flow (${getOrdinal(j)})`);
            let flow=actions[i].flow
            let trigger
            let stop_if_present
            if(actions[i].stop_if_present){
                loadSelector(actions[i].stop_if_present)
                .then(val=>{
                    trigger=true
                })
            }
            for(let k=0;k<flow.length;k++){
                // if (i==a && k<b){
                //     continue
                // }
                if(flow[k].wait){
                    await sleep(flow[k].wait*1000)
                    chrome.runtime.sendMessage({update:`Waiting ${flow[k].wait} seconds...`})
                }
                else if(flow[k].event){
                    if(flow[k].event=='click'){
                        if(trigger){
                            console.log('Stop element found.Stopping...');
                            chrome.runtime.sendMessage({update:"Stop element found.Stopping..."})
                        }
                        else{
                            chrome.runtime.sendMessage({update:`searching for ${flow[k].target}`})
                            let elmt=await loadSelector(flow[k].target)
                            console.log(flow[k].target,'found,clicking');
                            chrome.runtime.sendMessage({update:`${flow[k].target} found,clicking'`})
                            elmt.click()
                        }
                        
                    }
                    else if(flow[k].event=='scroll'){
                        await sleep(1000)
                        if(flow[k].target){
                            chrome.runtime.sendMessage({update:`searching for ${flow[k].target}`})
                            let elmt=await loadSelector(flow[k].target)
                            console.log(flow[k].target,'found,scrolling');
                            chrome.runtime.sendMessage({update:`${flow[k].target} found,scrolling`})
                            try {
                                elmt.scrollBy(0,flow[k].depth)
                            } catch (error) {
                                console.log(elmt, ' not scrollable');
                                chrome.runtime.sendMessage({update:`${flow[k].target} not scrollable`})
                            }
                        }else{
                            console.log('Scrolling main page');
                            chrome.runtime.sendMessage({update:"Scrolling main page"})
                            window.scrollBy(0,flow[k].depth)
                        }
                        
                    }
                    else if(flow[k].event=='navigate'){
                        console.log('Navigating to',flow[k].target);
                        window.location.href=flow[k].target
                        chrome.runtime.sendMessage({
                            update:`navigating to ${flow[k].target}`,
                            proceedFlow:id,
                            position:[i,k+1]
                        })
                        break
                        
                    }
                }
            }
        }
    }


const  loadSelector=async(selector)=> {
    var raf;
    var found = false;
    let el

    return new Promise((resolve,reject)=>{
        (function check(){
            el = document.evaluate(selector,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
            
            if (el) {
                found = true;
                cancelAnimationFrame(raf);
                console.log('Finally found',el);
                resolve(el)
                
                if(!found){
                raf = requestAnimationFrame(check);
                }
                
            
            } else {
                raf = requestAnimationFrame(check);
            }
            })();
    })

    
}

    
    // loadSelector('div[ref="eWrapper"] > input[ref="eInput"]')
    // let ff=await loadSelector('#ember32 > div > span.t-12.t-black--light.t-normal')

    // console.log('Found',ff);
    
    // flow.forEach(async item=>{
    //     await sleep(1500)
    //     if(item.event=='click'){
    //         let tgt=document.querySelector('#ember32 > div > span.t-12.t-black--light.t-normal')
    //         console.log('Here is the target',tgt);
    //     }
    // })
}

const sleep=(ms)=> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const getOrdinal=(n) =>{
    let ord = 'th';
  
    if (n % 10 == 1 && n % 100 != 11)
    {
      ord = 'st';
    }
    else if (n % 10 == 2 && n % 100 != 12)
    {
      ord = 'nd';
    }
    else if (n % 10 == 3 && n % 100 != 13)
    {
      ord = 'rd';
    }
  
    return ord;
  }