import { hcWithType } from "@repo/api/hc";

  export const api = hcWithType(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");
  
