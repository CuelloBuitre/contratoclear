import { useEffect, useState } from 'react'
import { animate } from 'framer-motion'

/**
 * Animates a displayed number from 0 to `target` when `enabled` becomes true.
 * Respects prefers-reduced-motion by skipping directly to the target value.
 */
export function useCountUp(target: number, enabled: boolean, duration = 1.4) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!enabled) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setValue(target)
      return
    }

    const controls = animate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [enabled, target, duration])

  return value
}
