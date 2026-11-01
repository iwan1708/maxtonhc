import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

function app(){
  const listeners={},elements={'#app':{},'#question':{focus(){this.focused=true}}};
  const context={Intl,Date,location:{hash:'#dashboard'},document:{querySelector:s=>elements[s],addEventListener:(event,handler)=>{listeners[event]=handler}},window:{addEventListener(){}}};
  const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8').replace(/init\(\)\.catch\([\s\S]*$/,'');
  runInNewContext(source,context);
  runInNewContext(`user={id:'member',name:'Member',company:'PT <Contoh>',role:'member'};state={products:[{id:'jd',lessons:[]}],access:[],progress:[],events:[],registrations:[],jobs:[],submissions:[],documents:[],chat:[],aiConfigured:false}`,context);
  return {context,listeners,elements};
}

test('company knowledge appears at the bottom of dashboard and navigation',()=>{
  const {context}=app();
  const html=runInNewContext('dashboard()',context);
  assert.ok(html.indexOf('id="knowledge-title"')>html.indexOf('class="dashboard-bottom"'));
  assert.match(html,/PT &lt;Contoh&gt;/);
  assert.match(html,/0 dokumen berlaku/);
  assert.equal((html.match(/data-action="knowledge-category"/g)||[]).length,4);
  assert.equal(runInNewContext('nav.at(-1)[2]',context),'Pengetahuan Perusahaan');
  assert.match(runInNewContext('policyForm.toString()',context),/Profil Perusahaan/);
});

test('company category opens document knowledge and filters effective policies',async()=>{
  const {context,listeners,elements}=app();
  runInNewContext(`state.documents=[
    {id:'active',title:'Kebijakan Pelatihan',category:'Kebijakan HR',status:'berlaku',effective:'2020-01-01',version:'1',text:'Pengajuan melalui HR.'},
    {id:'draft',title:'Draft Belum Disetujui',category:'Kebijakan HR',status:'draft',effective:'2020-01-01',version:'1',text:'Draft'},
    {id:'future',title:'Aturan Masa Depan',category:'Kebijakan HR',status:'berlaku',effective:'2099-01-01',version:'1',text:'Future'},
    {id:'expired',title:'Aturan Lama',category:'Kebijakan HR',status:'berlaku',effective:'2020-01-01',end:'2021-01-01',version:'1',text:'Expired'},
    {id:'sop',title:'SOP Operasional',category:'SOP',status:'berlaku',effective:'2020-01-01',version:'1',text:'SOP'}
  ]`,context);
  await listeners.click({target:{closest:()=>({dataset:{action:'knowledge-category',id:'Kebijakan HR'}})},preventDefault(){}});
  assert.equal(context.location.hash,'knowledge');
  context.location.hash='#knowledge';
  await runInNewContext('render()',context);
  assert.match(elements['#app'].innerHTML,/Kebijakan Pelatihan/);
  assert.doesNotMatch(elements['#app'].innerHTML,/Draft Belum Disetujui|Aturan Masa Depan|Aturan Lama|SOP Operasional/);
  assert.match(elements['#app'].innerHTML,/chat-widget-launcher/);
});

test('admin can open knowledge and manage only its own supplied document state',async()=>{
  const {context,elements}=app();
  runInNewContext(`user={id:'admin',name:'Admin',company:'Maxton',role:'admin'};admin={}`,context);
  context.location.hash='#knowledge';await runInNewContext('render()',context);
  assert.match(elements['#app'].innerHTML,/Pengetahuan Perusahaan\./);
  assert.match(elements['#app'].innerHTML,/Dokumen & Kebijakan/);
  context.location.hash='#policies';await runInNewContext('render()',context);
  assert.match(elements['#app'].innerHTML,/Tambah dokumen/);
});
