(function(root){
const D=root.SKILL_DATA;
const blank=(key,level=100,extra=14)=>({key,level,extra,points:D[key].map(s=>(s.default||s.free)&&level>=s.rqLv?1:0)});
const spent=b=>D[b.key].reduce((n,s,i)=>n+(s.free||s.default?0:b.points[i]),0);
function clean(b){const t=D[b.key];b.points=t.map((s,i)=>s.default?1:s.free?(b.level>=s.rqLv?1:0):b.level<s.rqLv?0:Math.max(0,Math.min(s.maxValue,Math.floor(Number(b.points[i])||0))));let change=true;while(change){change=false;t.forEach((s,i)=>{if(b.points[i]&&s.preSkill>=0&&b.points[s.preSkill]<s.preValue){b.points[i]=0;change=true}})}return b}
function set(b,i,v){const t=D[b.key],s=t[i];if(!s||!s.maxValue||s.free||s.default)return {error:'此技能自动习得，不消耗 SP。'};if(b.level<s.rqLv)return {error:`需要职业等级 ${s.rqLv}。`};const next={...b,points:[...b.points]};v=Math.max(0,Math.min(s.maxValue,Math.floor(v)));function need(j,n){if(j<0||next.points[j]>=n)return;const x=t[j];if(b.level<x.rqLv)throw Error(`前置技能需要职业等级 ${x.rqLv}。`);need(x.preSkill,x.preValue);next.points[j]=n}try{if(v>0)need(s.preSkill,s.preValue)}catch(e){return {error:e.message}}next.points[i]=v;clean(next);if(spent(next)>b.level+b.extra)return {error:'剩余 SP 不足，已保留原配点。'};return {build:next}}
function preset(key){const b=blank(key);for(const [i,n] of Object.entries(root.SKILL_DEFAULTS?.[key]||{}))b.points[i]=n;return clean(b)}
root.SkillEngine={blank,preset,spent,clean,set};
})(typeof window==='undefined'?globalThis:window);
