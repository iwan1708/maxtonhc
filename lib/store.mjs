import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { dirname } from 'node:path';
export const uid=()=>randomBytes(12).toString('hex');
export function passwordHash(password) { const salt=uid(); return salt+':'+scryptSync(password,salt,64).toString('hex'); }
export function passwordMatches(password,hash) { const [salt,key]=hash.split(':'); return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(key,'hex')); }
export function plusYear(date) { const d=new Date(date); const month=d.getUTCMonth(); d.setUTCFullYear(d.getUTCFullYear()+1); if(d.getUTCMonth()!==month)d.setUTCDate(0); return d.toISOString(); }
export const products=[
 {id:'jd',title:'Penyusunan Job Description',tag:'ORGANIZATION DESIGN',description:'Ubah tanggung jawab menjadi peran yang jelas, terukur, dan selaras dengan organisasi.',icon:'briefcase',level:'Fundamental',price:1450000,color:'violet',lessons:['Memahami tujuan dan struktur jabatan','Menyusun tanggung jawab & wewenang','Menentukan kualifikasi dan kompetensi','Praktik: susun job description Anda'],content:['Job description menjelaskan mengapa jabatan dibutuhkan, hasil yang diharapkan, dan batas wewenangnya. Mulai dari tujuan bisnis, kemudian identifikasi kontribusi unik jabatan.\n\nLatihan: tulis satu kalimat tujuan jabatan dengan pola: melakukan apa, untuk siapa, dan hasil apa.','Pisahkan tanggung jawab (hasil yang harus dicapai) dari aktivitas (cara kerja). Gunakan kata kerja yang jelas dan hindari daftar yang tumpang tindih.\n\nLatihan: tulis tiga tanggung jawab dan tentukan satu indikator hasil untuk masing-masing.','Kualifikasi harus relevan terhadap pekerjaan. Kompetensi menjelaskan pengetahuan, keterampilan, dan perilaku yang dibutuhkan.\n\nLatihan: pilih tiga kompetensi utama dan jelaskan contoh perilaku yang dapat diamati.','Buka lembar kerja interaktif, lengkapi identitas jabatan, tujuan, dan tanggung jawab. Tinjau kesesuaiannya dengan struktur organisasi dan kebijakan perusahaan.\n\nKirim draft Anda melalui Tugas & Feedback untuk review.']},
 {id:'kpi',title:'KPI & Target Cascading',tag:'PERFORMANCE STRATEGY',description:'Turunkan sasaran bisnis menjadi indikator keberhasilan yang relevan bagi setiap peran.',icon:'chart',level:'Intermediate',price:1750000,color:'cyan'},
 {id:'strategy',title:'Strategi & Balanced Scorecard',tag:'STRATEGIC MANAGEMENT',description:'Hubungkan arah bisnis, peta strategi, dan prioritas pengembangan Human Capital.',icon:'layers',level:'Advanced',price:1950000,color:'green'},
 {id:'interview',title:'Interview Berbasis Kompetensi',tag:'TALENT ACQUISITION',description:'Bangun pertanyaan terstruktur dan rubrik interview sesuai kebutuhan jabatan.',icon:'users',level:'Fundamental',price:1450000,color:'cyan'},
 {id:'pay',title:'Sistem Remunerasi & Grading',tag:'COMPENSATION & BENEFIT',description:'Pelajari fondasi struktur penghasilan yang adil dan relevan dengan organisasi.',icon:'wallet',level:'Advanced',price:1950000,color:'violet'},
 {id:'appraisal',title:'Performance Appraisal',tag:'PEOPLE DEVELOPMENT',description:'Jadikan evaluasi kinerja sebagai percakapan pengembangan yang bermakna.',icon:'check',level:'Intermediate',price:1450000,color:'green'},
 {id:'competency',title:'Kamus & Pemetaan Kompetensi',tag:'COMPETENCY MANAGEMENT',description:'Petakan kompetensi dan kebutuhan pengembangan untuk setiap jabatan.',icon:'layers',level:'Intermediate',price:1750000,color:'violet'},
 {id:'supervisor',title:'Supervisor Development',tag:'LEADERSHIP',description:'Bekal praktis memimpin tim, memberi feedback, dan melakukan coaching.',icon:'users',level:'Fundamental',price:1450000,color:'green'},
 {id:'manager',title:'HR Manager Development',tag:'HR LEADERSHIP',description:'Kembangkan perspektif strategis untuk memimpin fungsi Human Capital.',icon:'briefcase',level:'Advanced',price:1950000,color:'cyan'}
].map(p=>({...p,lessons:p.lessons||['Fondasi dan konsep utama','Studi kasus praktis','Latihan penerapan'],content:p.content||['Materi contoh: pelajari konsep utama dan kaitkan dengan kebutuhan organisasi Anda.','Materi contoh: identifikasi masalah, pihak terkait, dan hasil yang diharapkan dari sebuah studi kasus.','Materi contoh: susun rencana penerapan dan tentukan bukti keberhasilannya.']}));
export function openStore(path='data/maxton.sqlite') {
 mkdirSync(dirname(path),{recursive:true}); const db=new DatabaseSync(path); db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
 db.exec(`CREATE TABLE IF NOT EXISTS records (kind TEXT NOT NULL,id TEXT NOT NULL,body TEXT NOT NULL,PRIMARY KEY(kind,id));`);
 const all=kind=>db.prepare('SELECT body FROM records WHERE kind=?').all(kind).map(r=>JSON.parse(r.body));
 const get=(kind,id)=>{const r=db.prepare('SELECT body FROM records WHERE kind=? AND id=?').get(kind,id);return r?JSON.parse(r.body):null};
 const put=(kind,value)=>{db.prepare('INSERT INTO records(kind,id,body) VALUES(?,?,?) ON CONFLICT(kind,id) DO UPDATE SET body=excluded.body').run(kind,value.id,JSON.stringify(value));return value};
 const remove=(kind,id)=>db.prepare('DELETE FROM records WHERE kind=? AND id=?').run(kind,id);
 const transaction=fn=>{db.exec('BEGIN IMMEDIATE');try{const v=fn();db.exec('COMMIT');return v}catch(e){db.exec('ROLLBACK');throw e}};
 if(!get('meta','seed'))transaction(()=>{
  const now=new Date(); const expires=plusYear(now);
  put('users',{id:'admin',name:'Admin Maxton',email:'admin@maxton.local',password:passwordHash('MaxtonAdmin!2026'),role:'admin',company:'Maxton Enterprise'});
  put('users',{id:'member',name:'Riana Kusuma',email:'member@maxton.local',password:passwordHash('MaxtonMember!2026'),role:'member',company:'PT Nusa Makmur Sentosa',position:'HR Manager',skills:['Job Description','KPI'],created:now.toISOString()});
  put('users',{id:'other',name:'Member Perusahaan Lain',email:'other@maxton.local',password:passwordHash('MaxtonOther!2026'),role:'member',company:'PT Cakra Contoh'});
  for(const module of ['jd','kpi','interview','appraisal'])put('access',{id:uid(),userId:'member',module,start:now.toISOString(),end:expires});
  put('progress',{id:'member:jd',userId:'member',module:'jd',done:[0,1]});
  for(const [i,title,module,days] of [[1,'Merumuskan Job Description yang Berdampak','jd',7],[2,'KPI Clinic: Dari Sasaran ke Ukuran','kpi',14],[3,'HR Strategic Conversation','strategy',21]]){const d=new Date(now);d.setDate(d.getDate()+days);d.setHours(12,30,0,0);put('events',{id:String(i),title,module,date:d.toISOString(),duration:90,format:'Zoom Workshop',mentor:i===1?'Praktisi Maxton — contoh':'Tim Learning Maxton — contoh',capacity:25,link:'',description:'Workshop interaktif dengan diskusi, studi kasus, dan latihan penerapan. Data jadwal ilustrasi.'})}
  put('registrations',{id:'member:1',userId:'member',eventId:'1',created:now.toISOString()});
  put('documents',{id:'sample-policy',userId:'member',title:'Kebijakan Pelatihan — Contoh',category:'Kebijakan HR',version:'1.0',status:'berlaku',effective:now.toISOString().slice(0,10),scope:'Seluruh karyawan',text:'DOKUMEN ILUSTRASI, BUKAN KEBIJAKAN RESMI.\nPasal 1 — Pengajuan Pelatihan\nSetiap pengajuan pelatihan memerlukan persetujuan atasan langsung dan HR.\nPasal 2 — Evaluasi\nPeserta menyampaikan laporan hasil belajar paling lambat 7 hari kerja setelah pelatihan.',updated:now.toISOString()});
  put('jobs',{id:'sample-job',userId:'member',title:'HR Supervisor',department:'Human Capital',superior:'HR Manager',location:'Head Office',purpose:'Memastikan proses operasional HR berjalan konsisten dan mendukung kebutuhan karyawan.',responsibilities:'Mengelola administrasi karyawan\nMengoordinasikan pelatihan\nMemantau ketepatan data HR',authority:'Mengusulkan perbaikan proses HR',qualifications:'Pengalaman operasional HR dan komunikasi yang baik',status:'Draft',updated:now.toISOString()});
  put('tasks',{id:uid(),title:'Siapkan materi workshop Job Description',owner:'Program',date:new Date(now.getTime()+3*864e5).toISOString().slice(0,10),status:'Dikerjakan'});
  put('tasks',{id:uid(),title:'Konfirmasi peserta kelas Zoom',owner:'Operasional',date:new Date(now.getTime()+5*864e5).toISOString().slice(0,10),status:'Belum dimulai'});
  put('meta',{id:'seed',version:1});
 });
 return {db,all,get,put,remove,transaction};
}
