import { handleRescue } from "@/lib/freight-rescue/handler";
import { DENVER_EXPRESS_CONFIG } from "@/lib/client-config";
export async function POST(request: Request) {
  return handleRescue(request, DENVER_EXPRESS_CONFIG.id);
}
