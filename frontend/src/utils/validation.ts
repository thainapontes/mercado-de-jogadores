import { z } from 'zod';

export function integerField(label: string, min: number, max: number) {
  const rangeMessage = `${label}: de ${min} a ${max}.`;
  return z
    .number({ error: `Informe ${label.toLowerCase()}.` })
    .int(`${label} precisa ser um número inteiro.`)
    .min(min, rangeMessage)
    .max(max, rangeMessage);
}

export function nameField(label: string, min: number, max: number) {
  return z
    .string()
    .transform((value) => value.trim().replace(/ +/g, ' '))
    .pipe(
      z
        .string()
        .min(1, { error: `Informe ${label.toLowerCase()}.`, abort: true })
        .min(min, `${label}: de ${min} a ${max} caracteres.`)
        .max(max, `${label}: de ${min} a ${max} caracteres.`),
    );
}

export function requiredChoice(message: string) {
  return z.string().min(1, message);
}
