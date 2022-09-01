import { IsUUID, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CandidaturePostDto{
  @IsUUID()
  @ApiProperty({
    required: true,
    type:'string',
    format: 'uuid'
  })
  minecraftUUID:string

  @ApiProperty({
    minLength:1024,
    maxLength:4096,
    nullable:false,
    required:true
  })
  @MinLength(1024)
  @MaxLength(4096)
  candidature: string;
}