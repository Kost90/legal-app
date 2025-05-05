export class SuccessResponseDTO<T> {
  statusCode: number;
  message: string;
  data: T;
}
