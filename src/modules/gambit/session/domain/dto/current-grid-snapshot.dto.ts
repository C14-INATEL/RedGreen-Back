import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EffectDto {
  @ApiProperty({
    example: 'MULTIPLY_POINTS',
    description: 'Type of the card effect',
  })
  Type: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Value associated with the effect, if applicable',
  })
  Value?: number;
}

export class CardDto {
  @ApiProperty({
    example: 0,
    description: 'Position of the card on the grid',
  })
  Position: number;

  @ApiProperty({
    example: 100,
    description: 'Point value of this card',
  })
  Points: number;

  @ApiProperty({
    type: 'object',
    nullable: true,
    description: 'Effect applied by this card, or null if none',
    properties: {
      Type: {
        type: 'string',
        example: 'MULTIPLY_POINTS',
        description: 'Type of the card effect',
      },
      Value: {
        type: 'number',
        example: 2,
        description: 'Value associated with the effect, if applicable',
      },
    },
  })
  Effect: EffectDto | null;
}

export class PendingEventDto {
  @ApiProperty({
    example: 'Good',
    description: 'Phase classification of the event',
  })
  Phase: string;

  @ApiProperty({
    type: 'array',
    description: 'Effects offered to the player during this event',
    items: {
      type: 'object',
      properties: {
        Type: {
          type: 'string',
          example: 'MULTIPLY_POINTS',
          description: 'Type of the card effect',
        },
        Value: {
          type: 'number',
          example: 2,
          description: 'Value associated with the effect, if applicable',
        },
      },
    },
  })
  OfferedEffects: EffectDto[];

  @ApiProperty({
    example: 12,
    description: 'Grid position targeted by this event',
  })
  TargetPosition: number;
}

export class CurrentGridSnapshotDto {
  @ApiProperty({
    type: 'array',
    description:
      'Cards not yet revealed. This array is stripped before any response reaches the client.',
    items: {
      type: 'object',
      properties: {
        Position: {
          type: 'number',
          example: 0,
          description: 'Position of the card on the grid',
        },
        Points: {
          type: 'number',
          example: 100,
          description: 'Point value of this card',
        },
        Effect: {
          type: 'object',
          nullable: true,
          description: 'Effect applied by this card, or null if none',
          properties: {
            Type: {
              type: 'string',
              example: 'MULTIPLY_POINTS',
              description: 'Type of the card effect',
            },
            Value: {
              type: 'number',
              example: 2,
              description: 'Value associated with the effect, if applicable',
            },
          },
        },
      },
    },
  })
  Unrevealed: CardDto[];

  @ApiProperty({
    type: 'array',
    description: 'Cards that have already been revealed',
    items: {
      type: 'object',
      properties: {
        Position: {
          type: 'number',
          example: 0,
          description: 'Position of the card on the grid',
        },
        Points: {
          type: 'number',
          example: 100,
          description: 'Point value of this card',
        },
        Effect: {
          type: 'object',
          nullable: true,
          description: 'Effect applied by this card, or null if none',
          properties: {
            Type: {
              type: 'string',
              example: 'MULTIPLY_POINTS',
              description: 'Type of the card effect',
            },
            Value: {
              type: 'number',
              example: 2,
              description: 'Value associated with the effect, if applicable',
            },
          },
        },
      },
    },
  })
  Revealed: CardDto[];

  @ApiProperty({
    type: 'object',
    nullable: true,
    description: 'Active pending event, or null if no event is in progress',
    properties: {
      Phase: {
        type: 'string',
        example: 'Good',
        description: 'Phase classification of the event',
      },
      OfferedEffects: {
        type: 'array',
        description: 'Effects offered to the player during this event',
        items: {
          type: 'object',
          properties: {
            Type: {
              type: 'string',
              example: 'MULTIPLY_POINTS',
              description: 'Type of the card effect',
            },
            Value: {
              type: 'number',
              example: 2,
              description: 'Value associated with the effect, if applicable',
            },
          },
        },
      },
      TargetPosition: {
        type: 'number',
        example: 12,
        description: 'Grid position targeted by this event',
      },
    },
  })
  PendingEvent: PendingEventDto | null;
}
