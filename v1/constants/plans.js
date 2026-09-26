// Business rule, not environment config: the same on every deployment.
// On the base plan, active clients and active bank accounts are each capped at this number;
// premium has no limit.
export const BASE_PLAN_LIMIT = 4;
