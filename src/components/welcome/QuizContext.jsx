import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';

const QuizCtx = createContext(null);

export const useQuiz = () => useContext(QuizCtx);

const blank = (preset) => ({
  step: preset.occasion ? 2 : 1,
  occasion: preset.occasion || '',
  group: '',
  villa: '',
  sel: { s: null, e: null },
  flexible: false,
  window: '',
  name: '',
  email: '',
  phone: '',
  status: 'idle',
  touched: false,
  from: '',
});

const reducer = (state, patch) => ({ ...state, ...patch });

// One shared state for every quiz on the page, so the hero and the bottom form always show the same step.
export function QuizProvider({ preset = {}, children }) {
  const [q, dispatch] = useReducer(reducer, preset, blank);
  const set = useCallback((patch, from) => dispatch({ ...patch, touched: true, ...(from ? { from } : {}) }), []);
  const value = useMemo(() => ({ q, set }), [q, set]);
  return <QuizCtx.Provider value={value}>{children}</QuizCtx.Provider>;
}
