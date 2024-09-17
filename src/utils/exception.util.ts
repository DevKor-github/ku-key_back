// 커스텀 예외 구조 정의
interface kukeyExceptionResponse {
  name: string;
  message: string;
  errorCode: number;
  statusCode: number;
}

// 커스텀 예외 종류
export const kukeyExceptions: Record<string, kukeyExceptionResponse> = {};

// kukeyExceptions의 key들을 type으로 사용
export type kukeyExceptionName = keyof typeof kukeyExceptions;

// Error 클래스를 상속받아 kukeyException 클래스 정의
export class kukeyException extends Error {
  readonly errorCode: number;
  readonly statusCode: number;

  constructor(name: kukeyExceptionName) {
    super(kukeyExceptions[name].message);
    this.name = name;
    this.errorCode = kukeyExceptions[name].errorCode;
    this.statusCode = kukeyExceptions[name].statusCode;
  }
}

// 예외 던지는 함수
export function throwKukeyException(name: kukeyExceptionName): never {
  throw new kukeyException(name);
}
