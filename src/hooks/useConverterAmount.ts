'use client';

import { useState } from 'react';

export interface ConverterAmountOptions {
  /** FROM → TO, the quote the screen already showed. */
  toRight: (from: number) => number;
  /** TO → FROM, the same quote read backwards — what the player must put in. */
  toLeft: (to: number) => number;
  /** How a DERIVED from-value is rendered (the typed one is shown verbatim). */
  formatLeft?: (value: number) => string;
  /** How a DERIVED to-value is rendered. */
  formatRight?: (value: number) => string;
}

export interface ConverterAmount {
  /** Numeric FROM amount — typed or derived. */
  from: number;
  /** Numeric TO amount — typed or derived. */
  to: number;
  /** What the FROM input renders. */
  fromValue: string;
  /** What the TO input renders. */
  toValue: string;
  /** Player typed into FROM (pass the already-sanitized string). */
  setFrom: (raw: string) => void;
  /** Player typed into TO. */
  setTo: (raw: string) => void;
  /** Clear both sides — call when the modal closes. */
  reset: () => void;
}

/**
 * Two-way converter fields: whichever side the player types in drives the other.
 *
 * Both wallet converters (LC→TON, TON→LS) used to accept a number on the FROM
 * side only and print the result as text, so "I want 1 TON — how much LC is
 * that?" had no answer but trial and error against a rate the player can't see.
 *
 * ONE raw string is kept, plus which side it was typed into — never two, which
 * is what makes a round-trip stable: deriving a value, printing it into the
 * other field and then re-deriving from that print is how converters drift
 * (type 5, get 4.999, get 4.998…). The derived side is a pure function of the
 * typed one, recomputed on every render, and the moment the player types into
 * it that side becomes the authority instead.
 */
export function useConverterAmount({
  toRight,
  toLeft,
  formatLeft = String,
  formatRight = String,
}: ConverterAmountOptions): ConverterAmount {
  const [edited, setEdited] = useState<'left' | 'right'>('left');
  const [raw, setRaw] = useState('');

  const typed = Number(raw) || 0;
  const from = edited === 'left' ? typed : toLeft(typed);
  const to = edited === 'left' ? toRight(typed) : typed;

  return {
    from,
    to,
    // An empty field stays empty rather than showing a derived 0: "0" in the
    // other box reads as an answer, and there is no question yet.
    fromValue: edited === 'left' ? raw : raw ? formatLeft(from) : '',
    toValue: edited === 'right' ? raw : raw ? formatRight(to) : '',
    setFrom: value => {
      setEdited('left');
      setRaw(value);
    },
    setTo: value => {
      setEdited('right');
      setRaw(value);
    },
    reset: () => {
      setEdited('left');
      setRaw('');
    },
  };
}
