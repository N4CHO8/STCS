import { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRequestHandler<TRequest extends Request = Request> = (
  req: TRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = <TRequest extends Request = Request>(
  handler: AsyncRequestHandler<TRequest>
): RequestHandler => {
  return (req, res, next) => {
    handler(req as TRequest, res, next).catch(next);
  };
};
