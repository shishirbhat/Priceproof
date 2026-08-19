import type { NextFunction, Request, RequestHandler, Response } from "express";

// Express 4 does not forward a rejected promise from an async handler to
// error middleware on its own — without this, a query failure would hang
// the request instead of returning the 500 from server.ts.
export function ah(fn: (req: Request, res: Response) => Promise<void>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}
