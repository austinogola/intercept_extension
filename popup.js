// const toggler=document.querySelector('#toggler')
// const title=document.querySelector('p')
// const in_put=document.querySelector('input')

const form=document.querySelector('form')
const txt_input=document.querySelector('#text_field')
const user_id_input=document.querySelector('#userId')

const user_id_label=document.querySelector('#user_id_label')
const txt_label=document.querySelector('#text_label')

const statusColor=document.querySelector('#status_color')
const statusText=document.querySelector('#current-status')

// toggler.addEventListener('click',e=>{
  
//     if (e.target.checked){
//         title.innerHTML='Connected'
//         console.log('Changed to connected');
//         localStorage.setItem('Ext_state','ON')
//         chrome.runtime.sendMessage({state: 'ON'})
//         statusText.innerText='Connected'
//         statusText.style.color='#2196F3'
//         statusColor.style.backgroundColor='#2196F3'
        
//     }else{
//         title.innerHTML='Disconnected'
//         console.log('Changed to disconnected');
//         localStorage.setItem('Ext_state','OFF')
//         chrome.runtime.sendMessage({state: 'OFF'})
//         statusText.innerText='Disconnected'
//         statusText.style.color='#F1592B'
//         statusColor.style.backgroundColor='#F1592B'
//         // checkState()
//     }
// })


form.addEventListener('submit',e=>{
    e.preventDefault()
    console.log('Submitted');

    if(user_id_input.value!==''){
        user_id_label.innerText=`User ID : (${user_id_input.value})`
        localStorage.setItem('localUser_ID',user_id_input.value)
        chrome.runtime.sendMessage({setId:user_id_input.value})
        statusText.innerText='Connected'
        statusText.style.color='#2196F3'
        statusColor.style.backgroundColor='#2196F3'
    }

    if(txt_input.value!==''){
        txt_label.innerText=`Task : (${txt_input.value})`
        localStorage.setItem('localUser_text',txt_input.value)
        chrome.runtime.sendMessage({setTask:txt_input.value})
    }

    user_id_input.value=''
    txt_input.value=''

})


async function checkState(){

    const state=localStorage.getItem('Ext_state')
    const userId=localStorage.getItem('localUser_ID')
    
    const text=localStorage.getItem('localUser_text')
   
    
    if(state){
        if (state=='OFF') {
            // title.innerHTML='Disconnected'
            statusText.innerText='Disconnected'
            statusText.style.color='#F1592B'
            // toggler.checked=false
            statusColor.style.backgroundColor='#F1592B'
            
            chrome.runtime.sendMessage({state: 'OFF',un:true})
        }else{
            // title.innerHTML='Connected'
            statusText.innerText='Connected'
            statusColor.style.backgroundColor='#2196F3'
            statusText.style.color='#2196F3'
            // toggler.checked=true
            chrome.runtime.sendMessage({state: 'ON',un:true})


        }
    }
    else{
        localStorage.setItem('state','ON')
        chrome.runtime.sendMessage({state: 'ON',un:true})
    }

    if(userId){
        console. log('userId found',userId)
        // statusColor.style.backgroundColor='#2196F3'
        // statusText.style.color='#2196F3'
        // statusText.innerText='Connected'
        user_id_label.innerText=`User ID : (${userId})`
        chrome.runtime.sendMessage({setId:userId,un:true})
    }
    else{
        statusColor.style.backgroundColor='#F1592B'
        statusText.style.color='#F1592B'
        statusText.innerText='No user id' 
    }
    if(text){
        console. log('task found',text)
        txt_label.innerText=`Task : (${text})`
        chrome.runtime.sendMessage({setTask:text,un:true})
    }else{
        
    }

}

checkState()

const handleSchedules=(arr)=>{
    arr.forEach(sched=>{
        let schedule_item=document.createElement('div')
        schedule_item.setAttribute('class','schedule-item')

        //Details
        let schedule_details=document.createElement('div')
        schedule_details.setAttribute('class','schedule-details')

        let name=document.createElement('div')
        name.setAttribute('class','name')

        let action_name=document.createElement('p')
        action_name.innerHTML=sched.name
        let action_pic=document.createElement('img')
        action_name.setAttribute('alt','X')
        name.appendChild(action_pic,action_name)


        let status_info=document.createElement('div')
        status_info.setAttribute('class','status-inf')
        let st_text=document.createElement('p')
        st_text.innerHTML='Status'
        console.log(st_text);
        let act_st_text=document.createElement('p')
        act_st_text.innerHTML=sched.enabled?'Enabled':'Disabled'
        console.log(act_st_text);
        status_info.appendChild(st_text)
        status_info.appendChild(act_st_text)


        schedule_details.appendChild(name)
        schedule_details.appendChild(status_info)


        //Time
        let schedule_time=document.createElement('div')
        schedule_time.setAttribute('class','schedule-time')

        let time=document.createElement('div')
        time.setAttribute('class','time')
        let every=document.createElement('p')
        every.innerHTML=`Every ${sched.period} ${sched.every}${sched.period==1?'':'s'}`
        time.appendChild(every)

        let icons=document.createElement('div')
        icons.setAttribute('class','icons')

        schedule_time.appendChild(time)


        schedule_item.appendChild(schedule_details)
        schedule_item.appendChild(schedule_time)
        
        const mainE=document.querySelector('.schedule-content')
        mainE.appendChild(schedule_item)
    })
}



let tablinks=document.querySelectorAll('.tablinks')

tablinks.forEach(item=>{
    item.addEventListener('click',e=>{
        tablinks.forEach(item=>{
            item.classList.remove('active')
        })

        e.target.classList.add('active')

        let idn=e.target.innerHTML.toLowerCase()
        console.log('idn id',idn);

        let tabcontent = document.querySelectorAll(".tabcontent");
        tabcontent.forEach(item=>{
            item.style.display='none'
            if(item.id==idn){
                item.style.display='block'
            }
        })

        if(idn=="schedules"){
            var port = chrome.runtime.connect({
                name: "Schedules exchange"
            });
            port.postMessage({fetchSchedules:true});
            port.onMessage.addListener(function(msg) {
                console.log("message recieved");
                if(msg.schedules){
                    
                    handleSchedules(msg.schedules);
                }
            });

        }
        else if(idn=="actions"){
            chrome.runtime.sendMessage({fetchActions:true})
        }
        else if(idn=="actions"){
            chrome.runtime.sendMessage({fetchRules:true})
        }
    })


    
})