export interface JwtPayload {
  id?: number;
  email?: string;
}

export interface RequestWithUser extends Request {
  params: {
    id: string;
  };
  user: {
    id: string;
    userEmail: string;
  };
}
