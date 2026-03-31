import { createCrudHandlers } from "@/lib/api/crud-factory";
export const { GET, POST } = createCrudHandlers("location");
