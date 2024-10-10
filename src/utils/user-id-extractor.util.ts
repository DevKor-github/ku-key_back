export function extractUserId(request: any): string {
  let userId: string = 'Not Logged In';

  // 로그인한 사용자의 경우 - userId 바로 추출
  if (request.user) {
    userId = request.user.id;
  } else if (request.headers['authorization'].split(' ')[0] === 'Bearer') {
    // 토큰은 있지만, 만료된 경우 - 토큰에서 userId 추출
    const splitedTokens = request.headers['authorization']
      .split(' ')[1]
      .split('.');
    const tokenPayload = JSON.parse(atob(splitedTokens[1]));
    userId = tokenPayload.id;
  }
  return userId;
}
