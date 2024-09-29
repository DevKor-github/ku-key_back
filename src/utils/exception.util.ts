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
  // - 10xx : 일반 인증 관련
  LOGIN_REQUIRED: {
    name: 'LOGIN_REQUIRED',
    message: '로그인이 필요합니다.',
    errorCode: 1000,
    statusCode: 401,
  },
  INVALID_EMAIL: {
    name: 'INVALID_EMAIL',
    message: '이메일이 잘못되었습니다.',
    errorCode: 1001,
    statusCode: 400,
  },
  INVALID_PASSWORD: {
    name: 'INVALID_PASSWORD',
    message: '비밀번호가 일치하지 않습니다.',
    errorCode: 1002,
    statusCode: 400,
  },
  VERIFY_TOKEN_NOT_FOUND: {
    name: 'VERIFY_TOKEN_NOT_FOUND',
    message: '해당 메일로 전송된 인증번호가 없습니다.',
    errorCode: 1003,
    statusCode: 404,
  },
  INVALID_VERIFY_TOKEN: {
    name: 'INVALID_VERIFY_TOKEN',
    message: '인증번호가 일치하지 않습니다.',
    errorCode: 1004,
    statusCode: 401,
  },
  // - 11xx : 토큰 관련
  INVALID_ACCESS_TOKEN: {
    name: 'INVALID_ACCESS_TOKEN',
    message: '액세스 토큰이 유효하지 않습니다.',
    errorCode: 1100,
    statusCode: 401,
  },
  ACCESS_TOKEN_EXPIRED: {
    name: 'ACCESS_TOKEN_EXPIRED',
    message: '액세스 토큰이 만료되었습니다. 리프레시를 시도해주세요.',
    errorCode: 1101,
    statusCode: 401,
  },
  INVALID_REFRESH_TOKEN: {
    name: 'INVALID_REFRESH_TOKEN',
    message: '리프레시 토큰이 유효하지 않습니다.',
    errorCode: 1102,
    statusCode: 401,
  },
  REFRESH_TOKEN_EXPIRED: {
    name: 'REFRESH_TOKEN_EXPIRED',
    message: '리프레시 토큰이 만료되었습니다.',
    errorCode: 1103,
    statusCode: 401,
  },
  MISSING_AUTHORIZATION_HEADER: {
    name: 'MISSING_AUTHORIZATION_HEADER',
    message: 'Authorization header가 존재하지 않습니다.',
    errorCode: 1104,
    statusCode: 400,
  },
  INVALID_TOKEN_TYPE: {
    name: 'INVALID_TOKEN_TYPE',
    message: '토큰 유형이 유효하지 않습니다.',
    errorCode: 1105,
    statusCode: 400,
  },
  MISSING_TOKEN: {
    name: 'MISSING_TOKEN',
    message: '토큰 정보가 없습니다.',
    errorCode: 1106,
    statusCode: 400,
  },
  REFRESH_TOKEN_UPDATE_FAILED: {
    name: 'REFRESH_TOKEN_UPDATE_FAILED',
    message: '리프레시 토큰 업데이트에 실패했습니다.',
    errorCode: 1107,
    statusCode: 500,
  },
  REFRESH_TOKEN_NOT_MATCHED: {
    name: 'REFRESH_TOKEN_NOT_MATCHED',
    message: '리프레시 토큰이 데이터베이스 정보와 일치하지 않습니다.',
    errorCode: 1108,
    statusCode: 400,
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
  USER_VERIFICATION_FAILED: {
    name: 'USER_VERIFICATION_FAILED',
    message: '유저 스크린샷 인증에 실패했습니다.',
    errorCode: 2002,
    statusCode: 500,
  },
  PASSWORD_UPDATE_FAILED: {
    name: 'PASSWORD_UPDATE_FAILED',
    message: '유저 비밀번호 변경에 실패했습니다.',
    errorCode: 2003,
    statusCode: 500,
  },
  ADMIN_ONLY_ACCESSIBLE: {
    name: 'ADMIN_ONLY_ACCESSIBLE',
    message: '관리자만 접근할 수 있습니다.',
    errorCode: 2004,
    statusCode: 403,
  },
  EMAIL_ALREADY_USED: {
    name: 'EMAIL_ALREADY_USED',
    message: '이미 해당 이메일이 존재합니다.',
    errorCode: 2005,
    statusCode: 400,
  },
  USERNAME_ALREADY_USED: {
    name: 'USERNAME_ALREADY_USED',
    message: '이미 해당 아이디가 존재합니다.',
    errorCode: 2006,
    statusCode: 400,
  },
  USER_DELETE_FAILED: {
    name: 'USER_DELETE_FAILED',
    message: '유저 삭제에 실패했습니다.',
    errorCode: 2007,
    statusCode: 500,
  },
  RE_REGISTRATION_NOT_ALLOWED: {
    name: 'RE_REGISTRATION_NOT_ALLOWED',
    message: '동일 이메일로 7일 이내에 재가입할 수 없습니다.',
    errorCode: 2008,
    statusCode: 400,
  },
  PROFILE_UPDATE_FAILED: {
    name: 'PROFILE_UPDATE_FAILED',
    message: '유저 프로필 업데이트에 실패했습니다.',
    errorCode: 2009,
    statusCode: 500,
  },
  INVALID_DATE_RANGE: {
    name: 'INVALID_DATE_RANGE',
    message: '시작 날짜보다 종료 날짜가 앞설 수 없습니다.',
    errorCode: 2010,
    statusCode: 400,
  },
  EXCHANGE_DAY_UPDATE_FAILED: {
    name: 'EXCHANGE_DAY_UPDATE_FAILED',
    message: '교환 날짜 업데이트에 실패했습니다.',
    errorCode: 2011,
    statusCode: 500,
  },
  SAME_PASSWORD: {
    name: 'SAME_PASSWORD',
    message: '이전 비밀번호와 동일합니다.',
    errorCode: 2012,
    statusCode: 400,
  },
  LANGUAGE_LIMIT_EXCEEDED: {
    name: 'LANGUAGE_LIMIT_EXCEEDED',
    message: '언어는 5개까지만 추가할 수 있습니다.',
    errorCode: 2013,
    statusCode: 400,
  },
  LANGUAGE_ALREADY_EXIST: {
    name: 'LANGUAGE_ALREADY_EXIST',
    message: '언어가 이미 존재합니다.',
    errorCode: 2014,
    statusCode: 409,
  },
  LANGUAGE_NOT_FOUND: {
    name: 'LANGUAGE_NOT_FOUND',
    message: '존재하지 않는 언어 정보입니다.',
    errorCode: 2015,
    statusCode: 404,
  },
  LANGUAGE_DELETE_FAILED: {
    name: 'LANGUAGE_DELETE_FAILED',
    message: '언어 삭제에 실패했습니다.',
    errorCode: 2016,
    statusCode: 500,
  },
  // - 21xx : Point
  POINT_NOT_ENOUGH: {
    name: 'POINT_NOT_ENOUGH',
    message: '포인트가 부족합니다.',
    errorCode: 2100,
    statusCode: 400,
  },
  ITEM_METADATA_MISSING: {
    name: 'ITEM_METADATA_MISSING',
    message: '아이템 메타데이터 정보가 없습니다.',
    errorCode: 2101,
    statusCode: 400,
  },
  ITEM_POINT_NOT_MATCHED: {
    name: 'ITEM_POINT_NOT_MATCHED',
    message: '요구 포인트가 아이템 정보와 일치하지 않습니다',
    errorCode: 2102,
    statusCode: 400,
  },

  // - 22xx : Character
  CHARACTER_NOT_FOUND: {
    name: 'CHARACTER_NOT_FOUND',
    message: '존재하지 않는 캐릭터 정보입니다.',
    errorCode: 2200,
    statusCode: 404,
  },
  CHARACTER_ALREADY_EXIST: {
    name: 'CHARACTER_ALREADY_EXIST',
    message: '캐릭터 정보가 이미 존재합니다.',
    errorCode: 2201,
    statusCode: 409,
  },
  CHARACTER_LEVEL_ALREADY_MAX: {
    name: 'CHARACTER_LEVEL_ALREADY_MAX',
    message: '이미 최대 레벨입니다.',
    errorCode: 2202,
    statusCode: 400,
  },
  CHARACTER_LEVEL_UPGRADE_FAILED: {
    name: 'CHARACTER_LEVEL_UPGRADE_FAILED',
    message: '캐릭터 레벨 업그레이드에 실패했습니다.',
    errorCode: 2203,
    statusCode: 500,
  },
  CHARACTER_TYPE_CHANGE_FAILED: {
    name: 'CHARACTER_TYPE_CHANGE_FAILED',
    message: '캐릭터 타입 변경에 실패했습니다.',
    errorCode: 2204,
    statusCode: 500,
  },
  CHARACTER_LEVEL_NOT_UNLOCKED: {
    name: 'CHARACTER_LEVEL_NOT_UNLOCKED',
    message: '해금되지 않은 레벨입니다.',
    errorCode: 2205,
    statusCode: 400,
  },
  CHARACTER_LEVEL_SELECT_FAILED: {
    name: 'CHARACTER_LEVEL_SELECT_FAILED',
    message: '캐릭터 레벨 선택에 실패했습니다.',
    errorCode: 2206,
    statusCode: 500,
  },
  // - 23xx : AttendanceCheck
  ATTENDANCE_ALREADY_CHECKED: {
    name: 'ATTENDANCE_ALREADY_CHECKED',
    message: '이미 오늘자 출석체크를 했습니다.',
    errorCode: 2300,
    statusCode: 409,
  },
  // 3xxx : 시간표 관련 예외
  // - 30xx : Course
  COURSE_NOT_FOUND: {
    name: 'COURSE_NOT_FOUND',
    message: '존재하지 않는 강의입니다.',
    errorCode: 3000,
    statusCode: 404,
  },
  MAJOR_REQURIED: {
    name: 'MAJOR_REQUIRED',
    message: '전공을 입력해주세요.',
    errorCode: 3001,
    statusCode: 400,
  },
  COLLEGE_REQURIED: {
    name: 'COLLEGE_REQUIRED',
    message: '단과대 정보를 입력해주세요.',
    errorCode: 3002,
    statusCode: 400,
  },
  // - 31xx : Schedule
  INVALID_TIME_RANGE: {
    name: 'INVALID_TIME_RANGE',
    message: '시작 시간보다 종료 시간이 앞설 수 없습니다.',
    errorCode: 3100,
    statusCode: 400,
  },
  SCHEDULE_CONFLICT: {
    name: 'SCHEDULE_CONFLICT',
    message: '스케쥴이 기존 강의/스케쥴 시간대와 충돌합니다.',
    errorCode: 3101,
    statusCode: 409,
  },
  SCHEDULE_NOT_FOUND: {
    name: 'SCHEDULE_NOT_FOUND',
    message: '존재하지 않는 스케쥴입니다.',
    errorCode: 3102,
    statusCode: 404,
  },

  // - 32xx : Timetable
  TIMETABLE_NOT_FOUND: {
    name: 'TIMETABLE_NOT_FOUND',
    message: '존재하지 않는 시간표입니다.',
    errorCode: 3200,
    statusCode: 404,
  },
  // - 33xx : CourseReview
  VIEWABLE_UNTIL_UPDATE_FAILED: {
    name: 'VIEWABLE_UNTIL_UPDATE_FAILED',
    message: '강의 열람권 날짜 업데이트에 실패했습니다.',
    errorCode: 3300,
    statusCode: 500,
  },
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
  CALENDAR_NOT_FOUND: {
    name: 'CALENDAR_NOT_FOUND',
    message: '행사/일정 정보를 찾을 수 없습니다.',
    errorCode: 5100,
    statusCode: 404,
  },
  CALENDAR_UPDATE_FAILED: {
    name: 'CALENDAR_UPDATE_FAILED',
    message: '행사/일정 업데이트에 실패했습니다.',
    errorCode: 5101,
    statusCode: 500,
  },
  CALENDAR_DELETE_FAILED: {
    name: 'CALENDAR_DELETE_FAILED',
    message: '행사/일정 삭제에 실패했습니다.',
    errorCode: 5102,
    statusCode: 500,
  },
  // 6xxx : S3, File 관련 예외
  NOT_IMAGE_FILE: {
    name: 'NOT_IMAGE_FILE',
    message: '이미지 파일만 업로드할 수 있습니다.',
    errorCode: 6000,
    statusCode: 400,
  },
  // 7xxx : Class-Validator, TypeORM 관련 예외
  VALIDATION_ERROR: {
    name: 'VALIDATION_ERROR',
    message: '올바르지 않은 입력 값입니다.',
    errorCode: 7000,
    statusCode: 400,
  },
};

// kukeyExceptions의 key들을 type으로 사용
export type kukeyExceptionName = keyof typeof kukeyExceptions;

// Error 클래스를 상속받아 kukeyException 클래스 정의
export class kukeyException extends Error {
  readonly errorCode: number;
  readonly statusCode: number;

  constructor(name: kukeyExceptionName, message?: string) {
    super(message ?? kukeyExceptions[name].message);
    this.name = name;
    this.errorCode = kukeyExceptions[name].errorCode;
    this.statusCode = kukeyExceptions[name].statusCode;
  }
}

// 예외 던지는 함수
export function throwKukeyException(
  name: kukeyExceptionName,
  message?: string,
): never {
  throw new kukeyException(name, message);
}
