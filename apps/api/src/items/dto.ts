import {
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsISO8601()
  dueAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  tag?: string;
}

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsISO8601()
  dueAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  tag?: string | null;

  @IsOptional()
  @IsString()
  statusId?: string;
}

export class MoveItemDto {
  @IsString()
  statusId!: string;
}
