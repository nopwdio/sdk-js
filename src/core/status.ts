import { endpoint } from "../internal/api/endpoint.js";

interface Status {
  success_count: number;
  error_count: number;
  total_exec_time_ms: number;
}

export const get = async function (limit: number = 1, scope?: string) {
  return (await endpoint({
    method: "GET",
    ressource: scope ? `/statuses/${scope}` : "/statuses",
  })) as Status[];
};
