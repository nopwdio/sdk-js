import { endpoint } from "../internal/api/endpoint.js";

interface Status {
  success_count: number;
  error_count: number;
  total_exec_time_ms: number;
}

export const get = async function (params: {
  limit?: number;
  scope?: string;
  signal?: AbortSignal;
}) {
  let ressource = params.scope ? `/statuses/${params.scope}` : "/statuses";
  ressource = params.limit ? `${ressource}?limit=${params.limit}` : ressource;

  return (await endpoint({
    method: "GET",
    ressource: ressource,
  })) as Status[];
};
