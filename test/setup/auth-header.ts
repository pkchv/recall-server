
export function auth(token: string): [string, string] {
  return ["Authorization", `Bearer ${token}`];
}
