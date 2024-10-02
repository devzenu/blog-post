import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class GetUsersParamDto {
  // in which id was optional thats we use apipropertyoptional
  //if case if is required we will use apiProperty
  @ApiPropertyOptional({
    description: 'Get user with a specific id ',
    example: 1234,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id?: number;
}
