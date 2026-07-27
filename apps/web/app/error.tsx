'use client'
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <section className="error-page"><p className="eyebrow">Error</p><h1>Something interrupted the experience.</h1><p>Please try again. No operation was authorized by this interruption.</p><button className="button" onClick={reset}>Try again</button></section>}

