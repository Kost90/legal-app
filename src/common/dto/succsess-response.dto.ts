export class SuccessResponseDTO<T> {
  statusCode: number;
  timestamp: string;
  data: T;
}
