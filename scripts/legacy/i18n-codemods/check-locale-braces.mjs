import fs from 'fs';
for (const loc of ['en','ja','ko','fr','de','es','ru','pt']) {
  let d=0,s=null,e=false;
  const t=fs.readFileSync(`src/i18n/locales/${loc}.ts`,'utf8');
  for (const c of t) {
    if(s){ if(e)e=false; else if(c==='\\')e=true; else if(c===s)s=null; continue;}
    if(c==='"'||c==="'"){s=c;continue;}
    if(c==='{')d++; if(c==='}')d--;
  }
  console.log(loc, d);
}
