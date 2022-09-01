import { ErrorHttpStatusCode } from "@nestjs/common/utils/http-error-by-code.util";

export interface CandidatureError{
  code:ErrorHttpStatusCode,
  message:string;
}