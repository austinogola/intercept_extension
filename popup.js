const toggler=document.querySelector('#toggler')
const title=document.querySelector('p')
const in_put=document.querySelector('input')

const form=document.querySelector('form')
const txt_input=document.querySelector('#text_field')
const user_id_input=document.querySelector('#userId')

const user_id_label=document.querySelector('#user_id_label')
const txt_label=document.querySelector('#text_label')

const statusColor=document.querySelector('#statusColor')
const statusText=document.querySelector('#statusText')

toggler.addEventListener('click',e=>{
  
    if (e.target.checked){
        title.innerHTML='Connected'
        console.log('Changed to connected');
        localStorage.setItem('Ext_state','ON')
        checkState()
        
    }else{
        title.innerHTML='Disconnected'
        console.log('Changed to disconnected');
        localStorage.setItem('Ext_state','OFF')
        checkState()
    }
})


form.addEventListener('submit',e=>{
    e.preventDefault()
    console.log('Submitted');

    if(user_id_input.value!==''){
        user_id_label.innerText=`User ID : (${user_id_input.value})`
        localStorage.setItem('localUser_ID',user_id_input.value)
        chrome.runtime.sendMessage({setId:user_id_input.value})
    }

    if(txt_input.value!==''){
        txt_label.innerText=`Text : (${txt_input.value})`
        localStorage.setItem('localUser_text',txt_input.value)
        chrome.runtime.sendMessage({setTxt:txt_input.value})
    }

    user_id_input.value=''
    txt_input.value=''

    checkState()
})


async function checkState(){

    const state=localStorage.getItem('Ext_state')
    const userId=localStorage.getItem('localUser_ID')
    
    const text=localStorage.getItem('localUser_text')
   
    
    if(state){
        if (state=='OFF') {
            console. log('State is',state)
            title.innerHTML='Disconnected'
            statusText.innerText='Disconnected'
            statusText.style.color='#F1592B'
            toggler.checked=false
            statusColor.style.backgroundColor='#F1592B'
            
            chrome.runtime.sendMessage({state: 'OFF'})
        }else{
            title.innerHTML='Connected'
            console.log(statusColor.style)
            statusColor.style.backgroundColor='#2196F3'
            statusText.innerText='Connected'
            statusText.style.color='#2196F3'
            toggler.checked=true
            chrome.runtime.sendMessage({state: 'ON'})


        }
    }
    else{
        localStorage.setItem('state','ON')
        chrome.runtime.sendMessage({state: 'ON',popup:true})
    }

    if(userId){
        console. log('userId found',userId)
        // statusColor.style.backgroundColor='#2196F3'
        // statusText.style.color='#2196F3'
        // statusText.innerText='Connected'
        user_id_label.innerText=`User ID : (${userId})`
        chrome.runtime.sendMessage({setId:userId})
    }
    else{
        statusColor.style.backgroundColor='#F1592B'
        statusText.style.color='#F1592B'
        statusText.innerText='Enter your ID' 
    }
    if(text){
        console. log('text found',text)
        txt_label.innerText=`Text : (${text})`
        chrome.runtime.sendMessage({setTxt:text})
    }else{
        
    }

}

checkState()