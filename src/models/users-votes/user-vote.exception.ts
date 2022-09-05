export enum UserVoteErrorEnum {
  USER_HAS_NOT_THE_RIGHT_TO_VOTE = 'user has not the right to vote',
  USER_WHO_WAS_VOTE_IS_NOT_CANDIDATE = 'user who was vote is not candidate',
  NOT_ENOUGH_VOTE = 'not enough vote',
  NOT_ENOUGH_POSITIVE_VOTE = 'not enough positive vote',
}

export class UserVoteException extends Error {
  public readonly type: UserVoteErrorEnum;
  constructor(error: UserVoteErrorEnum) {
    super(UserVoteErrorEnum[error]);
    this.name = 'UserVoteError';
    this.message = UserVoteErrorEnum[error];
    this.type = error;
  }
}