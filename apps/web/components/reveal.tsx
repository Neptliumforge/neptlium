'use client'
import { useEffect, useRef, useState } from 'react'

export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const node=ref.current; if(!node)return; const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setVisible(true);observer.disconnect()}},{rootMargin:'0px 0px -8%'}); observer.observe(node); return()=>observer.disconnect() },[])
  return <div ref={ref} className={'reveal '+(visible?'is-visible ':'')+className}>{children}</div>
}
