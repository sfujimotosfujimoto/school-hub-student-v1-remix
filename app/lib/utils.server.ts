export function errorResponse(message: string, statusCode: number) {
  return new Response(message, {
    status: statusCode,
    statusText: message,
  })
}
