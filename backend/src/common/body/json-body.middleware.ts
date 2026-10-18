import { text } from 'express';
import type { NextFunction, Request, Response } from 'express';

export const INVALID_JSON_BODY = Symbol('INVALID_JSON_BODY');

const readJsonAsText = text({ type: 'application/json' });

export function jsonBody(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  readJsonAsText(req, res, (error?: unknown) => {
    if (error) {
      req.body = INVALID_JSON_BODY;
    } else if (typeof req.body === 'string') {
      req.body = parseJson(req.body);
    }
    next();
  });
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return INVALID_JSON_BODY;
  }
}
