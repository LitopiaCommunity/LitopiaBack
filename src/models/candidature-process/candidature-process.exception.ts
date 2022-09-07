export enum CandidatureProcessErrorEnum {
  USER_HAS_NOT_THE_RIGHT_TO_ACCEPT = 'user has not the right to accept',
  USER_WHO_IS_ACCEPTED_IS_NOT_PRE_ACCEPTED = 'user who is accepted is not pre accepted',
}

export class CandidatureProcessException extends Error{
  public readonly type: CandidatureProcessErrorEnum;
  constructor(error: CandidatureProcessErrorEnum) {
    super(CandidatureProcessErrorEnum[error]);
    this.name = 'CandidatureProcessError';
    this.message = CandidatureProcessErrorEnum[error];
    this.type = error;
  }
}