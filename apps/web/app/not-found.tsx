import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center 
   bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200 to-slate-300">
      <div className="pb-12">
        <img
          width={280}
          height={100}
          src="/brand/logo-light-tight.png"
          alt="Oxonom EDU"
          className="h-16 w-auto object-contain drop-shadow-sm"
        />
      </div>
      <div className="space-y-6 text-center">
        <h1 className="text-8xl leading-7 font-bold text-black drop-shadow-md">
          404!
        </h1>
        <p className="text-lg pt-8 text-black tracking-tight font-medium leading-normal">
          Aradığınız sayfa bulunamadı veya taşınmış olabilir.
        </p>
      </div>
      <div className="pt-8 flex flex-col items-center">
        <Link
          href="/"
          className="flex w-fit h-[50px] text-xl space-x-2 bg-[#4B075F] hover:bg-[#620B79] px-6 py-2 rounded-xl font-bold text-white items-center shadow-md gap-2 transition-colors"
        >
          <span>Ana Sayfaya Dön</span>
          <ArrowRight className="tracking-tight transition-transform duration-150 ease-in-out ms-1" />
        </Link>
      </div>
    </div>
  )
}
