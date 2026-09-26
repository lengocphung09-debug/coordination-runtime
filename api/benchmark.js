const fs=require("fs"),path=require("path"),crypto=require("crypto");
const EXPECTED={
 ARIS_9_5:{file:"targets/ARIS-v9.5.md",sha256:"f214b1e598a0c9aa19558a9fd1572555a2abebaaf770d0e3f1e8b41379ece425"},
 ARIS_SUPER_1_3:{file:"targets/ARIS_SUPER_v1.3_EMPIRICAL_RUNTIME_CLOSURE_DESIGN_CANDIDATE_EN.md",sha256:"ce564eb1de70474f999595e6980e673903d228a8decac098f29f7ceba6f65c4a"}
};
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const mono=()=>Number(process.hrtime.bigint()/1000000n);
function identity(){
 const targets={}; let all=true;
 for(const [id,x] of Object.entries(EXPECTED)){
  const p=path.join(process.cwd(),x.file);
  if(!fs.existsSync(p)){targets[id]={status:"UNBOUND",expected_sha256:x.sha256,artifact:x.file};all=false;continue;}
  const b=fs.readFileSync(p), observed=sha(b), ok=observed===x.sha256;
  targets[id]={status:ok?"VERIFIED":"HASH_MISMATCH",expected_sha256:x.sha256,observed_sha256:observed,size_bytes:b.length,artifact:x.file}; if(!ok)all=false;
 }
 return {gate:"TARGET_IDENTITY_G01",status:all?"PASS":"BLOCKED",targets};
}
module.exports=async(req,res)=>{
 const t0=mono(), run_id=crypto.randomUUID(), id=identity(), trace=[{span_id:"identity",parent_span_id:null,start_monotonic_ms:t0,end_monotonic_ms:mono(),status:id.status}];
 if(req.method==="GET") return res.status(id.status==="PASS"?200:409).json({service:"aris-dual-benchmark-harness",version:"1.0.0-candidate",run_id,identity:id,trace});
 if(req.method!=="POST") return res.status(405).json({error:"method_not_allowed"});
 if(id.status!=="PASS") return res.status(409).json({run_id,state_before:"DEFINED",state_after:"BLOCKED",reason:"TARGET_IDENTITY_NOT_VERIFIED",identity:id,trace});
 return res.status(501).json({run_id,state_before:"DEFINED",state_after:"BLOCKED",reason:"EXECUTABLE_TARGET_ADAPTERS_NOT_BOUND",identity:id,trace,
 required:["ARIS95_EXECUTOR","ARIS_SUPER13_EXECUTOR","OBSERVABLE_OUTPUT_STATE","RUNTIME_TRACE_TIMING"]});
};