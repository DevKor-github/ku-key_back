// 커스텀 예외 구조 정의
interface kukeyExceptionResponse {
  name: string;
  message: string;
  errorCode: number;
  statusCode: number;
}

// 커스텀 예외 종류
export const kukeyExceptions: Record<string, kukeyExceptionResponse> = {
  // 1xxx : 인증 관련 예외
  LOGIN_REQUIRED: {
    name: 'LOGIN_REQUIRED',
    message: '로그인이 필요합니다.',
    errorCode: 1000,
    statusCode: 401,
  },
  // 2xxx : 유저 관련 예외
  // - 20xx : User
  USER_NOT_FOUND: {
    name: 'USER_NOT_FOUND',
    message: '존재하지 않는 유저입니다.',
    errorCode: 2000,
    statusCode: 404,
  },
  USER_NOT_VERIFIED: {
    name: 'USER_NOT_VERIFIED',
    message: '인증되지 않은 유저입니다.',
    errorCode: 2001,
    statusCode: 400,
  },
  // - 21xx : Point
  // - 22xx : Character
  CHARACTER_NOT_FOUND: {
    name: 'CHARACTER_NOT_FOUND',
    message: '존재하지 않는 캐릭터 정보입니다.',
    errorCode: 2200,
    statusCode: 404,
  },
  // - 23xx : AttendanceCheck
  // 3xxx : 시간표 관련 예외
  // - 30xx : Course
  // - 31xx : Schedule
  // - 32xx : Timetable
  // - 33xx : CourseReview
  // - 34xx : Friendship
  FRIENDSHIP_NOT_FOUND: {
    name: 'FRIENDSHIP_NOT_FOUND',
    message: '존재하지 않는 친구 관계입니다.',
    errorCode: 3400,
    statusCode: 404,
  },
  FRIENDSHIP_REQUEST_TO_SELF: {
    name: 'FRIENDSHIP_REQUEST_TO_SELF',
    message: '자기 자신에게는 친구 요청을 보낼 수 없습니다.',
    errorCode: 3401,
    statusCode: 400,
  },
  FRIENDSHIP_ALREADY_EXIST: {
    name: 'FRIENDSHIP_ALREADY_EXIST',
    message: '이미 친구이거나, 요청 수락 대기중입니다.',
    errorCode: 3402,
    statusCode: 409,
  },
  FRIENDSHIP_ACCESS_FORBIDDEN: {
    name: 'FRIENDSHIP_ACCESS_FORBIDDEN',
    message: '해당 친구 요청이나 친구 관계에 대한 접근 권한이 없습니다.',
    errorCode: 3403,
    statusCode: 403,
  },
  FRIENDSHIP_REQUEST_ALREADY_ACCEPTED: {
    name: 'FRIENDSHIP_REQUEST_ALREADY_ACCEPTED',
    message: '이미 친구 요청을 수락했습니다.',
    errorCode: 3404,
    statusCode: 400,
  },
  FRIENDSHIP_REQUEST_NOT_ACCEPTED: {
    name: 'FRIENDSHIP_REQUEST_NOT_ACCEPTED',
    message: '수락되지 않은 친구 요청입니다.',
    errorCode: 3405,
    statusCode: 400,
  },
  FRIENDSHIP_REQUEST_ACCEPT_FAILED: {
    name: 'FRIENDSHIP_REQUEST_ACCEPT_FAILED',
    message: '친구 요청 수락에 실패했습니다.',
    errorCode: 3406,
    statusCode: 500,
  },
  FRIENDSHIP_REQUEST_REJECT_FAILED: {
    name: 'FRIENDSHIP_REQUEST_REJECT_FAILED',
    message: '친구 요청 거절에 실패했습니다.',
    errorCode: 3407,
    statusCode: 500,
  },
  FRIENDSHIP_REQUEST_CANCEL_FAILED: {
    name: 'FRIENDSHIP_REQUEST_CANCEL_FAILED',
    message: '친구 요청 취소에 실패했습니다.',
    errorCode: 3408,
    statusCode: 500,
  },
  FRIENDSHIP_DELETE_FAILED: {
    name: 'FRIENDSHIP_DELETE_FAILED',
    message: '친구 관계 삭제에 실패했습니다.',
    errorCode: 3409,
    statusCode: 500,
  },
  FRIEND_TIMETABLE_NOT_FOUND: {
    name: 'FRIEND_TIMETABLE_NOT_FOUND',
    message: '친구의 시간표를 찾을 수 없습니다.',
    errorCode: 3410,
    statusCode: 404,
  },
  // 4xxx : 커뮤니티 관련 예외
  // - 40xx : Board
  // - 41xx : Post
  // - 42xx : Comment
  // - 43xx : Report
  // 5xxx : 메인 홈 관련 예외
  // - 50xx : Club
  CLUB_NOT_FOUND: {
    name: 'CLUB_NOT_FOUND',
    message: '동아리 정보를 찾을 수 없습니다.',
    errorCode: 5000,
    statusCode: 404,
  },
  CLUB_UPDATE_FAILED: {
    name: 'CLUB_UPDATE_FAILED',
    message: '동아리 정보 업데이트에 실패했습니다.',
    errorCode: 5001,
    statusCode: 500,
  },
  CLUB_DELETE_FAILED: {
    name: 'CLUB_DELETE_FAILED',
    message: '동아리 삭제에 실패했습니다.',
    errorCode: 5002,
    statusCode: 500,
  },

  // - 51xx : Calendar
  // 6xxx : S3, File 관련 예외
  NOT_IMAGE_FILE: {
    name: 'NOT_IMAGE_FILE',
    message: '이미지 파일만 업로드할 수 있습니다.',
    errorCode: 6000,
    statusCode: 400,
  },
};

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
