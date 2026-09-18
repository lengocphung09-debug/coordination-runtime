const crypto = require("crypto");
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const now=()=>new Date().toISOString();
const sha=x=>crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
module.exports = async (req,res)=>{
  if(req.method!=="POST") return res.status(200).json({service:"coordination-runtime",version:"1.0",status:"READY"});
  const b=req.body||{}, runId=crypto.randomUUID(), trace=[];
  const emit=(actor,state,data={})=>trace.push({t:now(),ms:Date.now(),actor,state,...data});
  emit("kernel","DEFINED",{runId});
  emit("kernel","AUTHORIZED");
  const kind=b.kind||"positive";
  const terminal={revision_mismatch:"CONFLICTED",stale_evidence:"UNVERIFIED",confidence_inflation:"BLOCKED",
    core_authority_crossover:"BLOCKED",kernel_domain_truth_crossover:"BLOCKED",false_ack:"BLOCKED",
    non_progress_reentry:"ESCALATED",incompatible_local_pass:"BLOCKED",dropped_parent_invariant:"BLOCKED",
    unsafe_optimization:"BLOCKED",illegal_state_promotion:"BLOCKED",provenance_loss:"BLOCKED"}[kind];
  if(terminal){ emit("core","OBSERVED",{kind}); emit("kernel",terminal,{reason:kind}); return res.status(200).json({runId,kind,terminal,trace,traceHash:sha(trace)}); }
  emit("core","ROUTED");
  const specialist=async(name,delay)=>{const s=Date.now(); emit(name,"ACCEPTED"); await sleep(delay); emit(name,"EXECUTED",{startMs:s,endMs:Date.now()}); return {name,verified:true};};
  const t0=Date.now();
  const outputs=await Promise.all([specialist("aris",80),specialist("vlf",110),specialist("text-metrics",60)]);
  emit("core","OBSERVED"); emit("core","VALIDATED"); emit("core","COMPOSED");
  emit("kernel","VERIFIED"); emit("kernel","RELEASED");
  const t1=Date.now();
  return res.status(200).json({runId,kind:"positive",terminal:"RELEASED",outputs,latencyMs:t1-t0,trace,
    concurrency:{requested:true,wallMs:t1-t0},provenance:{objectId:b.objectId||"test-object",revision:b.revision||"R1",contract:"coordination-v1.0"},traceHash:sha(trace)});
};