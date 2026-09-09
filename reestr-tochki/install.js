let installPrompt;
const standalone=()=>matchMedia('(display-mode: standalone)').matches || navigator.standalone===true;
const panel=document.getElementById('installation'),help=document.getElementById('install-help');
panel.hidden=standalone();
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;panel.hidden=standalone();});
window.addEventListener('appinstalled',()=>{panel.hidden=true;help.hidden=true;installPrompt=null;});
document.getElementById('install-registry').onclick=async()=>{
 if(installPrompt){
  const prompt=installPrompt;installPrompt=null;
  try{await prompt.prompt();const result=await prompt.userChoice;if(result.outcome==='accepted')panel.hidden=true;}catch{help.hidden=false;help.textContent='Откройте меню браузера и выберите установку приложения «Реестр».';}
 }else{
  help.hidden=false;
  help.textContent=/iPhone|iPad|iPod/.test(navigator.userAgent)?'В Safari нажмите «Поделиться» → «На экран Домой». Название: «Реестр».':'В меню Chrome выберите установку приложения «Реестр». Если оно уже установлено — «Открыть в приложении».';
 }
};
