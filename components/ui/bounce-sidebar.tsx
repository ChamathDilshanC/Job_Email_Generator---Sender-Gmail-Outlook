"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import Link from "next/link";
import { motion, useAnimate } from "motion/react";
import { arc } from "motion";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type BounceSidebarItem =
  | string
  | { label: string; href?: string; icon?: ReactNode }
  | { label: string; heading: true };

export type BounceSidebarProps = Omit<ComponentProps<"ul">, "onChange"> & {
  items: BounceSidebarItem[];
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
  dotColor?: string;
  iconOnly?: boolean;
};

export function BounceSidebar({
  items,
  value,
  defaultValue = 0,
  onChange,
  dotColor = "#FC4C01",
  iconOnly = false,
  className,
  ...props
}: BounceSidebarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeIndex = value ?? internalValue;

  const [dot, animate] = useAnimate<HTMLSpanElement>();
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const prevY = useRef<number | null>(null);

  const [dotSize, setDotSize] = useState(6);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    setDotSize(Math.round(6 * dpr) / dpr);
  }, []);

  useIsomorphicLayoutEffect(() => {
    let cancelled = false;
    const snap = () => {
      const el = itemRefs.current[activeIndex];
      if (cancelled || !el || !dot.current) return;
      const dpr = window.devicePixelRatio || 1;
      const size = Math.round(6 * dpr) / dpr;
      const toY =
        Math.round((el.offsetTop + el.offsetHeight / 2 - size / 2) * dpr) / dpr;
      animate(dot.current, { x: 0, y: toY }, { duration: 0 });
      prevY.current = toY;
      setReady(true);
    };

    snap();
    const raf = requestAnimationFrame(snap);
    document.fonts?.ready.then(snap);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (!el || !dot.current) return;

    const dpr = window.devicePixelRatio || 1;
    const toY =
      Math.round((el.offsetTop + el.offsetHeight / 2 - dotSize / 2) * dpr) /
      dpr;

    if (prevY.current === null) {
      animate(dot.current, { x: 0, y: toY }, { duration: 0 });
      prevY.current = toY;
      return;
    }

    const fromY = prevY.current;
    const delta = toY - fromY;
    prevY.current = toY;
    if (delta === 0) return;

    const distance = Math.abs(delta);
    const path = arc({
      strength: Math.min(0.8, 14 / distance),
      direction: delta > 0 ? "ccw" : "cw",
    });

    animate(
      dot.current,
      { x: 0, y: toY },
      { duration: 0.25, ease: "easeOut", path },
    );
  }, [activeIndex, animate, dot, dotSize]);

  const select = (index: number) => {
    if (value === undefined) setInternalValue(index);
    onChange?.(index);
  };

  return (
    <ul
      data-slot="bounce-sidebar"
      className={cn("relative flex flex-col gap-1", iconOnly ? "pl-0" : "pl-6", className)}
      {...props}
    >
      <span
        ref={dot}
        aria-hidden
        className="absolute left-2 top-0 rounded-full transition-opacity duration-150"
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: dotColor,
          opacity: iconOnly ? 0 : ready ? 1 : 0,
        }}
      />

      {items.map((item, index) => {
        const label = typeof item === "string" ? item : item.label;

        if (typeof item !== "string" && "heading" in item) {
          return (
            <li
              key={`${index}-${label}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              role="presentation"
              data-slot="bounce-sidebar-heading"
              style={{ color: dotColor }}
              className="px-1 pb-1 pt-7 text-[11px] font-semibold uppercase tracking-[0.14em] first:pt-0"
            >
              {label}
            </li>
          );
        }

        const href = typeof item === "string" ? undefined : item.href;
        const icon = typeof item === "string" ? undefined : item.icon;
        const isActive = index === activeIndex;
        const itemClassName = cn(
          "flex w-full cursor-pointer items-center gap-3 rounded-lg p-1 text-left text-sm transition-colors duration-200",
          iconOnly && "justify-center px-2 py-2",
          isActive ? "text-foreground" : "text-foreground/50",
        );

        return (
          <li
            key={`${index}-${label}`}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className={iconOnly ? "group relative" : undefined}
          >
            {href ? (
              <MotionLink
                href={href}
                data-slot="bounce-sidebar-item"
                data-active={isActive}
                onClick={() => select(index)}
                className={itemClassName}
                title={iconOnly ? label : undefined}
              >
                {icon}
                {!iconOnly && label}
                {iconOnly && (
                  <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {label}
                  </span>
                )}
              </MotionLink>
            ) : (
              <motion.button
                type="button"
                data-slot="bounce-sidebar-item"
                data-active={isActive}
                onClick={() => select(index)}
                className={itemClassName}
                title={iconOnly ? label : undefined}
              >
                {icon}
                {!iconOnly && label}
                {iconOnly && (
                  <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {label}
                  </span>
                )}
              </motion.button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
