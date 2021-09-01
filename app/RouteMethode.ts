interface RouteMethod {
    path: string,
    method: (ctx: any) => void,
    type: "delete"|"get"|"head"|"options"|"patch"|"post"|"put"
}
