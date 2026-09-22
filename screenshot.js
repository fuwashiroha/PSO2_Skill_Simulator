(function(){
'use strict';
const font='"Microsoft YaHei", "Yu Gothic", "Noto Sans CJK SC", sans-serif';
const clean=s=>{const el=document.createElement('div');el.innerHTML=String(s||'').replace(/<br\s*\/?\s*>/gi,' ');return el.textContent.trim()};
window.saveSkillScreenshot=async function(snap){
 const {build:b,skills:t,language,role}=snap,ja=language==='ja',tr=(zh,jp)=>ja?jp:zh;
 const visible=t.map((s,i)=>({s,i})).filter(({s})=>s.maxValue);
 const header=142,width=1228,height=header+24+Math.floor(visible.at(-1).i/6)*148+109+58;
 const canvas=document.createElement('canvas');canvas.width=width*2;canvas.height=height*2;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');ctx.scale(2,2);
 const rect=(x,y,w,h,fill,stroke)=>{ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1)}};
 const text=(value,x,y,size=12,color='#dce8f2',weight='normal')=>{ctx.font=weight+' '+size+'px '+font;ctx.fillStyle=color;ctx.fillText(String(value),x,y)};
 const pos=i=>({x:18+i%6*202,y:header+24+Math.floor(i/6)*148});
 const ids=[...new Set(visible.map(({s})=>'skill_icon_'+s.img))];
 const images=new Map(await Promise.all(ids.map(id=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve([id,img]);img.onerror=()=>reject(Error('Icon: '+id));const src=window.SCREENSHOT_ICONS[id];if(!src){reject(Error('Missing icon: '+id));return}img.src=src}))));
 if(document.fonts?.ready)await document.fonts.ready;
 rect(0,0,width,height,'#0c131b');
 text('PSO2 Skill Simulator',20,30,21,'#f1f6fa','bold');
 text(snap.title+'  ·  '+tr(role==='main'?'主职业':'副职业',role==='main'?'メインクラス':'サブクラス'),20,64,20,'#f1f6fa','bold');
 text(tr('主职：','メイン：')+snap.main+'   /   '+tr('副职：','サブ：')+snap.sub,20,89,13,'#a1b7cb');
 text('Lv. '+b.level+'   '+tr('追加 SP：','追加 SP：')+b.extra+'   '+tr('已用','使用')+' '+snap.spent+' / '+(b.level+b.extra)+' SP   '+tr('剩余','残り')+' '+(b.level+b.extra-snap.spent)+' SP',20,113,13,'#61c5b4');
 text(tr('绿色：已习得    灰色：未习得    粉色名称：主职限定','緑：習得済み    灰：未習得    ピンクの名前：メイン限定'),20,135,11,'#a1b7cb');
 rect(8,header+4,width-16,height-header-42,'#101d29','#304558');
 // Draw connections before cards, preserving the simulator's grid and prerequisites.
 for(const {s,i} of visible){if(s.preSkill<0)continue;let j=s.preSkill;while(!t[j].maxValue&&t[j].preSkill>=0)j=t[j].preSkill;
  const p=pos(i),a=pos(j),mid=p.y-19,ready=b.level>=s.rqLv&&b.points[s.preSkill]>=s.preValue;
  ctx.strokeStyle=ready?'#61c5b4':'#405368';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x+92,a.y+109);ctx.lineTo(a.x+92,mid);ctx.lineTo(p.x+92,mid);ctx.lineTo(p.x+92,p.y);ctx.stroke();
  if(s.preValue>0){rect(p.x+80,mid-8,24,15,'#101d29');ctx.textAlign='center';text(s.preValue,p.x+92,mid+4,10,ready?'#8ee7d5':'#9aabbb');ctx.textAlign='left'}
 }
 for(const {s,i} of visible){const p=pos(i),lv=b.points[i],ready=b.level>=s.rqLv&&(s.preSkill<0||b.points[s.preSkill]>=s.preValue);
  rect(p.x,p.y,184,109,lv?'#193d40':'#1b2b3a',lv?'#498f88':'#3b5065');
  ctx.drawImage(images.get('skill_icon_'+s.img),p.x+9,p.y+10,34,34);
  const name=clean(ja?(s.nameJa||s.name):(s.nameZh||s.name));
  let size=13,lines=[];
  do{ctx.font='bold '+size+'px '+font;lines=[''];for(const ch of name){let last=lines.length-1;if(ctx.measureText(lines[last]+ch).width>124&&lines[last])lines.push(ch);else lines[last]+=ch}if(lines.length<=3)break;size--}while(size>=8);
  lines.forEach((line,k)=>text(line,p.x+49,p.y+17+k*(size+2),size,s.mainOnly?'#ffaaaa':ready||lv?'#dce8f2':'#96a6b7','bold'));
  const meta=s.mainOnly?tr('主职限定','メイン限定'):s.subOnly?tr('副职限定','サブ限定'):s.rqLv?'Lv.'+s.rqLv:tr('技能等级','スキルレベル');
  text(meta,p.x+9,p.y+67,10,'#acc8ca');ctx.textAlign='right';text(lv+' / '+s.maxValue,p.x+175,p.y+67,11,lv?'#8de6d1':'#b1c2d0');ctx.textAlign='left';
  if(s.free||s.default){text((lv?'✓ '+(s.default?tr('初始习得','初期習得'):tr('自动习得','自動習得')):'Lv.'+s.rqLv+' '+tr('解锁','解放'))+' · 0 SP',p.x+9,p.y+91,11,'#aacfc6')}
  else{const count=s.maxValue+1,gap=2,w=(166-(count-1)*gap)/count;
   for(let n=0;n<count;n++){const x=p.x+9+n*(w+gap),filled=n>0&&n<=lv;rect(x,p.y+79,w,21,filled?'#60c3af':'#263b4d',filled?null:'#435a6e');ctx.textAlign='center';text(n===s.maxValue?'M':n,x+w/2,p.y+94,11,filled?'#10302e':'#dce8f2',filled?'bold':'normal');ctx.textAlign='left'}
  }
 }
 text(tr('游戏图像 © SEGA','ゲーム画像 © SEGA'),20,height-16,12,'#91a8bc');
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG export failed')),'image/png'));
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='PSO2-'+b.key+'-'+role+'-'+language+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'.png';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
};
})();
