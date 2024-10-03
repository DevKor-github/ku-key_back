export function extractUserId(request: any): string {
  let tokenPayload;
  let userId: string = 'Not Logged In';

  // 로그인한 사용자의 경우 - userId 추출
  if (request.headers['authorization']) {
    const splitedTokens = request.headers['authorization']
      .split(' ')[1]
      .split('.');
    tokenPayload = JSON.parse(atob(splitedTokens[1]));
    userId = tokenPayload.id;
  }
  return userId;
}
