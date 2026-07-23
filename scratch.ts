import { prebuiltAppConfig } from "@mlc-ai/web-llm";
console.log(prebuiltAppConfig.model_list.map(m => m.model_id).filter(m => m.includes("Hermes") || m.includes("Llama-3.2") || m.includes("Qwen") || m.includes("Phi")));
