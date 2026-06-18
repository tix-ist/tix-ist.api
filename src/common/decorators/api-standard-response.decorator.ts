import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseMetaDto } from '../dto/meta.dto';
import { ProblemDto } from '../dto/problem.dto';

interface StandardResponseOptions {
  status?: number;
  description?: string;
}

/** Documents a `{ data: <model> }` success response (the standard envelope). */
export function ApiStandardResponse<TModel extends Type>(
  model: TModel,
  options: StandardResponseOptions = {},
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: options.status ?? 200,
      description: options.description,
      schema: {
        type: 'object',
        properties: { data: { $ref: getSchemaPath(model) } },
      },
    }),
  );
}

/** Documents a `{ data: <model>[], meta: { nextCursor } }` paginated response. */
export function ApiPaginatedResponse<TModel extends Type>(
  model: TModel,
  options: StandardResponseOptions = {},
) {
  return applyDecorators(
    ApiExtraModels(model, ResponseMetaDto),
    ApiResponse({
      status: options.status ?? 200,
      description: options.description,
      schema: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: getSchemaPath(model) } },
          meta: { $ref: getSchemaPath(ResponseMetaDto) },
        },
      },
    }),
  );
}

/** Documents an RFC 7807 `application/problem+json` error response. */
export function ApiProblemResponse(status: number, description?: string) {
  return applyDecorators(
    ApiExtraModels(ProblemDto),
    ApiResponse({
      status,
      description,
      content: {
        'application/problem+json': {
          schema: { $ref: getSchemaPath(ProblemDto) },
        },
      },
    }),
  );
}
