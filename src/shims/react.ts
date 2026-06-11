// Zustand v5 optional peer dependency shim
// 我们的游戏不使用 React，提供空实现

export function useState<T>(initial: T): [T, (v: T) => void] {
  return [initial, () => {}];
}

export function useRef<T>(initial: T): { current: T } {
  return { current: initial };
}

export function useEffect(_fn: () => void, _deps?: any[]): void {}
export function useCallback<T extends Function>(fn: T, _deps?: any[]): T { return fn; }
export function useMemo<T>(fn: () => T, _deps?: any[]): T { return fn(); }
export function useSyncExternalStore<T>(subscribe: any, getSnapshot: () => T): T {
  return getSnapshot();
}

export function createElement(_type: any, _props: any, ..._children: any[]): any {
  return null;
}

export function memo<T>(component: T): T { return component; }

export default { useState, useRef, useEffect, useCallback, useMemo, createElement, memo };
