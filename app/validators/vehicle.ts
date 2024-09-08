import Ajv, { JSONSchemaType } from "ajv";

const ajv = new Ajv();

interface VehicleSearchRequest {
  make?: string;
  model?: string;
  year?: number;
}
const vehicleSearchRequestSchema: JSONSchemaType<VehicleSearchRequest> = {
  type: 'object',
  properties: {
    make: { type: 'string', nullable: true },
    model: { type: 'string', nullable: true },
    year: { type: 'number', nullable: true },
  },
  required: []
};
export const validateVehicleSearchRequest = ajv.compile(vehicleSearchRequestSchema);

export interface VehicleSearchResponseRow {
  make: string;
  model: string;
  year: number;

  efficiency: number;
  cylinders: number;
  liters: number;
  drive: string;
  transmission: string;

  score: number;
}
const vehicleSearchResponseSchema: JSONSchemaType<VehicleSearchResponseRow[]> = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      make: { type: 'string' },
      model: { type: 'string' },
      year: { type: 'number' },
      efficiency: { type: 'number' },
      cylinders: { type: 'number' },
      liters: { type: 'number' },
      drive: { type: 'string' },
      transmission: { type: 'string' },
      score: { type: 'number' },
    },
    required: ['make', 'model', 'year', 'efficiency', 'cylinders', 'liters', 'drive', 'transmission', 'score']
  }
};
export const validateVehicleSearchResponse = ajv.compile(vehicleSearchResponseSchema);